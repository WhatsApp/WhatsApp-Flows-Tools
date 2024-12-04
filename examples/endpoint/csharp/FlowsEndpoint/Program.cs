/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;

var app = WebApplication.CreateBuilder(args).Build();
var PRIVATE_KEY = Environment.GetEnvironmentVariable("PRIVATE_KEY") ?? throw new InvalidOperationException("The environment variable 'PRIVATE_KEY' is not set.");
var PASSPHRASE = Environment.GetEnvironmentVariable("PASSPHRASE") ?? throw new InvalidOperationException("The environment variable 'PASSPHRASE' is not set.");

app.MapPost("/", (EndpointPayload body) =>
{
    var decrypted = EncryptionUtils.DecryptRequest(body.encrypted_aes_key, body.encrypted_flow_data, body.initial_vector, PRIVATE_KEY, PASSPHRASE);

    // Example to read decrypted fields
    var action = decrypted.decryptedBody.GetProperty("action").GetString();

    // Return the next screen & data to client
    var response = new { screen = "SCREEN_NAME", data = new { some_key = "some_value" } };
    var encryptedResponse = EncryptionUtils.EncryptResponse(response, decrypted.aesKeyBytes, decrypted.initialVectorBytes);

    // Return the response as plaintext
    return Results.Content(encryptedResponse, "text/plain");

})
.WithName("PostEndpointData");

app.Run();

record EndpointPayload(string encrypted_aes_key, string encrypted_flow_data, string initial_vector);

public class EncryptionUtils
{
    const int TAG_LENGTH = 16;

    public static (dynamic decryptedBody, byte[] aesKeyBytes, byte[] initialVectorBytes)
    DecryptRequest(string encryptedAesKey, string encryptedFlowData, string initialVector, string privatePem, string passphrase)
    {
        using (var rsa = RSA.Create())
        {
            // Load the private key from PEM
            var pemReader = new PemReader(new StringReader(privatePem), new PasswordFinder(passphrase));
            if (pemReader.ReadObject() is AsymmetricCipherKeyPair keyPair)
            {
                // Extract the private key parameters
                var privateKey = keyPair.Private as RsaPrivateCrtKeyParameters;
                if (privateKey == null)
                {
                    throw new CryptographicException("The provided PEM does not contain a valid RSA private key.");
                }

                // Convert Bouncy Castle RSA key parameters to .NET-compatible RSA parameters
                var rsaParams = DotNetUtilities.ToRSAParameters(privateKey);
                // Import into .NET RSA
                rsa.ImportParameters(rsaParams);
            }
            else
            {
                throw new CryptographicException("The provided PEM is not a valid encrypted PKCS#1 RSA private key.");
            }

            // Decrypt the AES key created by the client
            byte[] encryptedAesKeyBytes = Convert.FromBase64String(encryptedAesKey);
            byte[] aesKeyBytes = rsa.Decrypt(encryptedAesKeyBytes, RSAEncryptionPadding.OaepSHA256);

            // Decrypt the Flow data
            byte[] initialVectorBytes = Convert.FromBase64String(initialVector);
            byte[] flowDataBytes = Convert.FromBase64String(encryptedFlowData);
            byte[] plainTextBytes = new byte[flowDataBytes.Length - TAG_LENGTH];

            var cipher = new GcmBlockCipher(new AesEngine());
            var parameters = new AeadParameters(new KeyParameter(aesKeyBytes), TAG_LENGTH * 8, initialVectorBytes);
            cipher.Init(false, parameters);
            var offset = cipher.ProcessBytes(flowDataBytes, 0, flowDataBytes.Length, plainTextBytes, 0);
            cipher.DoFinal(plainTextBytes, offset);

            string decryptedJsonString = Encoding.UTF8.GetString(plainTextBytes);
            dynamic decryptedBody = JsonSerializer.Deserialize<dynamic>(decryptedJsonString);
            return (decryptedBody: decryptedBody, aesKeyBytes: aesKeyBytes, initialVectorBytes: initialVectorBytes);
        }
    }

    public static string EncryptResponse(dynamic response, byte[] aesKeyBytes, byte[] initialVectorBytes)
    {
        // Flip the initialization vector
        byte[] flippedIV = initialVectorBytes.Select(b => (byte)~b).ToArray();

        // Encrypt the response data
        string jsonResponse = JsonSerializer.Serialize(response);
        byte[] dataToEncrypt = Encoding.UTF8.GetBytes(jsonResponse);

        var cipher = new GcmBlockCipher(new AesEngine());
        var cipherParameters = new AeadParameters(new KeyParameter(aesKeyBytes), TAG_LENGTH * 8, flippedIV);

        // Encrypt the data
        cipher.Init(true, cipherParameters);
        byte[] encryptedDataBytes = new byte[cipher.GetOutputSize(dataToEncrypt.Length)];
        var offset = cipher.ProcessBytes(dataToEncrypt, 0, dataToEncrypt.Length, encryptedDataBytes, 0);
        cipher.DoFinal(encryptedDataBytes, offset);

        // Get the authentication tag
        byte[] authTag = new byte[TAG_LENGTH];
        Array.Copy(encryptedDataBytes, encryptedDataBytes.Length - TAG_LENGTH, authTag, 0, TAG_LENGTH);

        // Concatenate encrypted data and auth tag, then return as base64
        byte[] encryptedResponse = new byte[encryptedDataBytes.Length - TAG_LENGTH + TAG_LENGTH];
        Array.Copy(encryptedDataBytes, 0, encryptedResponse, 0, encryptedDataBytes.Length - TAG_LENGTH);
        Array.Copy(authTag, 0, encryptedResponse, encryptedDataBytes.Length - TAG_LENGTH, TAG_LENGTH);
        return Convert.ToBase64String(encryptedResponse);
    }
}

// Helper class for providing a password to the PemReader
public class PasswordFinder : IPasswordFinder
{
    private readonly char[] _password;

    public PasswordFinder(string password)
    {
        _password = password.ToCharArray();
    }

    public char[] GetPassword()
    {
        return _password;
    }
}
