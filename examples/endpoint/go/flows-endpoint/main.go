/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

const nonceSize = 16

type endpointPayload struct {
	EncryptedAESKey   string `json:"encrypted_aes_key"`
	EncryptedFlowData string `json:"encrypted_flow_data"`
	InitialVector     string `json:"initial_vector"`
}

type decryptionResult struct {
	DecryptedBody      map[string]interface{}
	AESKeyBytes        []byte
	InitialVectorBytes []byte
}

func main() {
	privateKey := os.Getenv("PRIVATE_KEY")
	passphrase := os.Getenv("PASSPHRASE")
	if privateKey == "" || passphrase == "" {
		log.Fatal("Environment variables 'PRIVATE_KEY' and 'PASSPHRASE' are required.")
	}

	r := gin.Default()
	r.POST("/", func(c *gin.Context) {
		encryptedResponse, err := processRequest(c, privateKey, passphrase)
		if err != nil {
			log.Print(err)
			c.String(500, "Internal Server Error")
			return
		}
		// Return encrypted response as plain text
		c.String(200, encryptedResponse)
	})
	r.Run(":3000")
}

func processRequest(c *gin.Context, privateKey string, passphrase string) (string, error) {
	var payload endpointPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		return "", err
	}

	// Decrypt the request data
	decrypted, err := decryptRequest(payload.EncryptedAESKey, payload.EncryptedFlowData, payload.InitialVector, privateKey, passphrase)
	if err != nil {
		return "", err
	}

	// Access decrypted fields
	action, ok := decrypted.DecryptedBody["action"].(string)
	if ok {
		fmt.Printf("Action: %s\n", action)
	}

	// Create a response object
	response := map[string]interface{}{
		"screen": "SCREEN_NAME",
		"data":   map[string]string{"some_key": "some_value"},
	}

	// Encrypt the response
	encryptedResponse, err := encryptResponse(response, decrypted.AESKeyBytes, decrypted.InitialVectorBytes)
	if err != nil {
		return "", err
	}

	return encryptedResponse, nil
}

func decryptRequest(encryptedAESKey string, encryptedFlowData string, initialVector string, privatePem string, passphrase string) (decryptionResult, error) {
	// Parse the private key
	block, _ := pem.Decode([]byte(privatePem))
	if block == nil || !x509.IsEncryptedPEMBlock(block) {
		return decryptionResult{}, errors.New("invalid PEM format or not encrypted")
	}

	decryptedKey, err := x509.DecryptPEMBlock(block, []byte(passphrase))
	if err != nil {
		return decryptionResult{}, err
	}

	privateKey, err := x509.ParsePKCS1PrivateKey(decryptedKey)
	if err != nil {
		return decryptionResult{}, err
	}

	// Decrypt the AES key
	encryptedAESKeyBytes, _ := base64.StdEncoding.DecodeString(encryptedAESKey)
	aesKeyBytes, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, privateKey, encryptedAESKeyBytes, nil)
	if err != nil {
		return decryptionResult{}, err
	}

	// Decrypt the Flow data
	initialVectorBytes, _ := base64.StdEncoding.DecodeString(initialVector)
	flowDataBytes, _ := base64.StdEncoding.DecodeString(encryptedFlowData)

	blockCipher, err := aes.NewCipher(aesKeyBytes)
	if err != nil {
		return decryptionResult{}, err
	}

	gcm, err := cipher.NewGCMWithNonceSize(blockCipher, nonceSize)
	if err != nil {
		return decryptionResult{}, err
	}

	decryptedPlaintext, err := gcm.Open(nil, initialVectorBytes, flowDataBytes, nil)
	if err != nil {
		return decryptionResult{}, err
	}

	var decryptedBody map[string]interface{}
	if err := json.Unmarshal(decryptedPlaintext, &decryptedBody); err != nil {
		return decryptionResult{}, err
	}

	return decryptionResult{
		DecryptedBody:      decryptedBody,
		AESKeyBytes:        aesKeyBytes,
		InitialVectorBytes: initialVectorBytes,
	}, nil
}

func encryptResponse(response map[string]interface{}, aesKeyBytes, initialVectorBytes []byte) (string, error) {
	// Flip the initialization vector
	flippedIV := make([]byte, len(initialVectorBytes))
	for i, b := range initialVectorBytes {
		flippedIV[i] = ^b
	}

	// Encrypt the response
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		return "", err
	}

	blockCipher, err := aes.NewCipher(aesKeyBytes)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCMWithNonceSize(blockCipher, nonceSize)
	if err != nil {
		return "", err
	}

	encryptedData := gcm.Seal(nil, flippedIV, jsonResponse, nil)
	return base64.StdEncoding.EncodeToString(encryptedData), nil
}
