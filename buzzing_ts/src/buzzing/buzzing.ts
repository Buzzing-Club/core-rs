/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/buzzing.json`.
 */
export type Buzzing = {
  "address": "3gvUXvA5CS8Ya42QKbcFEL682ABqSjEHR4XRYQhpBFcw",
  "metadata": {
    "name": "buzzing",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addStrategy",
      "discriminator": [
        64,
        123,
        127,
        227,
        192,
        234,
        198,
        20
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "strategyState",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "usedPrincipalPercent",
          "type": "u8"
        },
        {
          "name": "apy",
          "type": "u16"
        }
      ]
    },
    {
      "name": "closePools",
      "discriminator": [
        224,
        213,
        68,
        126,
        54,
        84,
        6,
        175
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "topic"
          ]
        },
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "topicId"
              },
              {
                "kind": "arg",
                "path": "creatorx"
              }
            ]
          }
        },
        {
          "name": "yesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creatorx",
          "type": "pubkey"
        },
        {
          "name": "topicId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closePoolsV2",
      "discriminator": [
        111,
        225,
        199,
        233,
        95,
        195,
        15,
        56
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true
          
        },
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "topicId"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "yesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "topicId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTopic",
      "discriminator": [
        17,
        149,
        231,
        194,
        81,
        173,
        176,
        41
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vaultUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "topic",
          "writable": true
        },
        {
          "name": "yesMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolToken",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "topicIpfsHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "receipt",
          "writable": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "userUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "usdbMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultUsdbLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "strategyId",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endTopic",
      "discriminator": [
        139,
        4,
        203,
        121,
        119,
        55,
        121,
        165
      ],
      "accounts": [
        {
          "name": "oracleAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "oracle",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vaultUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "topicId"
              },
              {
                "kind": "arg",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "yesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "yesPoolToken",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noPoolToken",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "topicId",
          "type": "u64"
        },
        {
          "name": "winningToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "usdcSwap",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "usdbLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "usdbFee",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "usdbSwap",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  100,
                  98
                ]
              }
            ]
          }
        },
        {
          "name": "globalStrategyRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeOracle",
      "discriminator": [
        144,
        223,
        131,
        120,
        196,
        253,
        181,
        99
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "oracle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "noSwap",
      "discriminator": [
        17,
        95,
        27,
        131,
        141,
        211,
        223,
        235
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "topicId"
              },
              {
                "kind": "arg",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "noPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "userNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "noTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "userUsdbAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "usdbMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolUsdbAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbFee",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "noTokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "topicId",
          "type": "u64"
        },
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "isNoToUsdb",
          "type": "bool"
        }
      ]
    },
    {
      "name": "redeem",
      "discriminator": [
        184,
        12,
        86,
        149,
        70,
        196,
        97,
        225
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "topicId"
              },
              {
                "kind": "arg",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "userUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "usdbMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultUsdbLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "yesToken",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "noToken",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "yesMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "noMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "topicId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapUsdcUsdb",
      "discriminator": [
        102,
        164,
        237,
        115,
        236,
        19,
        235,
        176
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vaultUsdc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  119,
                  97,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "vaultUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  100,
                  98
                ]
              }
            ]
          }
        },
        {
          "name": "userUsdc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userUsdb",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "usdbMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "isUsdcToUsdb",
          "type": "bool"
        }
      ]
    },
    {
      "name": "toggleStrategy",
      "discriminator": [
        19,
        121,
        87,
        100,
        131,
        50,
        135,
        162
      ],
      "accounts": [
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "strategyState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "strategyId"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": [
        {
          "name": "strategyId",
          "type": "u8"
        },
        {
          "name": "active",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateGlobalStrategyRegistry",
      "discriminator": [
        251,
        147,
        91,
        163,
        214,
        112,
        7,
        46
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "globalStrategyRegistry"
          ]
        },
        {
          "name": "globalStrategyRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "strategyIds",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "updateStrategyApr",
      "discriminator": [
        88,
        85,
        217,
        159,
        141,
        176,
        70,
        213
      ],
      "accounts": [
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "strategyState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "strategyId"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": [
        {
          "name": "strategyId",
          "type": "u8"
        },
        {
          "name": "newApy",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "receipt"
          ]
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "receipt",
          "writable": true
        },
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "userUsdb",
          "writable": true
        },
        {
          "name": "vaultUsdbLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "strategyId",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "yesSwap",
      "discriminator": [
        2,
        117,
        184,
        103,
        155,
        86,
        10,
        251
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "topic",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  112,
                  105,
                  99
                ]
              },
              {
                "kind": "arg",
                "path": "topicId"
              },
              {
                "kind": "arg",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "yesPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "userYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "yesTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "userUsdbAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "usdbMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolUsdbAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  111,
                  108,
                  95,
                  117,
                  115,
                  100,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbFee",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "yesTokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "topic"
              }
            ]
          }
        },
        {
          "name": "usdbMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "topicId",
          "type": "u64"
        },
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "isYesToUsdb",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalStrategyRegistry",
      "discriminator": [
        163,
        193,
        177,
        12,
        221,
        174,
        21,
        100
      ]
    },
    {
      "name": "liquidityPool",
      "discriminator": [
        66,
        38,
        17,
        64,
        188,
        80,
        68,
        129
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "oracle",
      "discriminator": [
        139,
        194,
        131,
        179,
        140,
        179,
        229,
        244
      ]
    },
    {
      "name": "receipt",
      "discriminator": [
        39,
        154,
        73,
        106,
        80,
        102,
        145,
        153
      ]
    },
    {
      "name": "strategyState",
      "discriminator": [
        83,
        18,
        224,
        109,
        174,
        100,
        39,
        139
      ]
    },
    {
      "name": "topic",
      "discriminator": [
        181,
        15,
        35,
        125,
        85,
        137,
        67,
        106
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "depositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "marketInitialized",
      "discriminator": [
        134,
        160,
        122,
        87,
        50,
        3,
        255,
        81
      ]
    },
    {
      "name": "oracleInitializedEvent",
      "discriminator": [
        237,
        38,
        54,
        160,
        251,
        223,
        25,
        41
      ]
    },
    {
      "name": "poolsClosedEvent",
      "discriminator": [
        239,
        119,
        192,
        71,
        124,
        150,
        111,
        126
      ]
    },
    {
      "name": "poolsClosedEventV2",
      "discriminator": [
        248,
        204,
        145,
        100,
        95,
        154,
        142,
        4
      ]
    },
    {
      "name": "redeemEvent",
      "discriminator": [
        90,
        114,
        83,
        146,
        212,
        26,
        217,
        59
      ]
    },
    {
      "name": "strategyEvent",
      "discriminator": [
        244,
        88,
        162,
        25,
        16,
        179,
        219,
        194
      ]
    },
    {
      "name": "swapEvent",
      "discriminator": [
        64,
        198,
        205,
        232,
        38,
        8,
        113,
        226
      ]
    },
    {
      "name": "topicEndedEvent",
      "discriminator": [
        31,
        186,
        190,
        43,
        100,
        252,
        148,
        137
      ]
    },
    {
      "name": "usdbMintUpdated",
      "discriminator": [
        169,
        142,
        61,
        73,
        98,
        1,
        186,
        180
      ]
    },
    {
      "name": "withdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "topicStillActive",
      "msg": "Topic is still active"
    },
    {
      "code": 6001,
      "name": "poolStillActive",
      "msg": "Pool is still active"
    },
    {
      "code": 6002,
      "name": "nonEmptyPool",
      "msg": "Pool is not empty, cannot be closed"
    },
    {
      "code": 6003,
      "name": "insufficientLiquidity",
      "msg": "Insufficient liquidity"
    },
    {
      "code": 6004,
      "name": "amountMustBeGreaterThanZero",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6005,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6006,
      "name": "excessiveSlippage",
      "msg": "Excessive price impact"
    },
    {
      "code": 6007,
      "name": "topicEnded",
      "msg": "Topic has ended"
    },
    {
      "code": 6008,
      "name": "invalidWinningToken",
      "msg": "Invalid winning token"
    },
    {
      "code": 6009,
      "name": "unauthorized",
      "msg": "Operation unauthorized"
    },
    {
      "code": 6010,
      "name": "unauthorizedOracle",
      "msg": "Oracle admin unauthorized"
    },
    {
      "code": 6011,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6012,
      "name": "invalidTopicTitle",
      "msg": "Invalid topic title"
    },
    {
      "code": 6013,
      "name": "invalidInitialPrice",
      "msg": "Invalid initial price"
    },
    {
      "code": 6014,
      "name": "invalidLiquidityRange",
      "msg": "Invalid liquidity range"
    },
    {
      "code": 6015,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6016,
      "name": "slippageExceeded",
      "msg": "Slippage exceeded limit"
    },
    {
      "code": 6017,
      "name": "invalidRemainingAccountsLength",
      "msg": "The number of strategy accounts does not match the registry"
    },
    {
      "code": 6018,
      "name": "invalidStrategyAccountOrder",
      "msg": "Strategy account order or PDA mismatch"
    },
    {
      "code": 6019,
      "name": "invalidStrategyPda",
      "msg": "Invalid strategy PDA"
    },
    {
      "code": 6020,
      "name": "invalidStrategyId",
      "msg": "Invalid strategy ID"
    },
    {
      "code": 6021,
      "name": "overflow",
      "msg": "Numerical overflow"
    },
    {
      "code": 6022,
      "name": "invalidProgramId",
      "msg": "Invalid program ID"
    },
    {
      "code": 6023,
      "name": "invalidPda",
      "msg": "Invalid PDA"
    },
    {
      "code": 6024,
      "name": "strategyNotFound",
      "msg": "Strategy not found"
    },
    {
      "code": 6025,
      "name": "noBalanceToWithdraw",
      "msg": "No balance to withdraw"
    },
    {
      "code": 6026,
      "name": "withdrawAmountExceedsBalance",
      "msg": "Withdraw amount exceeds balance"
    },
    {
      "code": 6027,
      "name": "invalidTimeDiff",
      "msg": "Invalid time difference"
    },
    {
      "code": 6028,
      "name": "invalidPrincipalPercent",
      "msg": "Invalid principal percent"
    },
    {
      "code": 6029,
      "name": "invalidApr",
      "msg": "Invalid APR"
    },
    {
      "code": 6030,
      "name": "strategyLimitReached",
      "msg": "Strategy limit reached"
    },
    {
      "code": 6031,
      "name": "strategyAlreadyInState",
      "msg": "Strategy already in this state"
    },
    {
      "code": 6032,
      "name": "aprNotChanged",
      "msg": "APR not changed"
    },
    {
      "code": 6033,
      "name": "topicNotEnded",
      "msg": "Topic not ended"
    },
    {
      "code": 6034,
      "name": "insufficientSwapLiquidity",
      "msg": "Insufficient swap liquidity"
    },
    {
      "code": 6035,
      "name": "accountNotWritable",
      "msg": "Account is not writable"
    },
    {
      "code": 6036,
      "name": "invalidTopicId",
      "msg": "Invalid topic ID"
    },
    {
      "code": 6037,
      "name": "creatorMismatch",
      "msg": "Creator mismatch"
    }
  ],
  "types": [
    {
      "name": "depositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "strategyId",
            "type": "u8"
          },
          {
            "name": "principal",
            "type": "u64"
          },
          {
            "name": "interest",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "globalStrategyRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "strategyIds",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "usdbMint",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "usdbReserve",
            "type": "pubkey"
          },
          {
            "name": "tokenReserve",
            "type": "pubkey"
          },
          {
            "name": "tickLower",
            "type": "u64"
          },
          {
            "name": "tickUpper",
            "type": "u64"
          },
          {
            "name": "currentPrice",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "nextId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "globalStrategyRegistry",
            "type": "pubkey"
          },
          {
            "name": "usdcSwap",
            "type": "pubkey"
          },
          {
            "name": "usdbLiquidity",
            "type": "pubkey"
          },
          {
            "name": "usdbFee",
            "type": "pubkey"
          },
          {
            "name": "usdbSwap",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "oracle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "oracleInitializedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracle",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "poolsClosedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topicId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "yesPool",
            "type": "pubkey"
          },
          {
            "name": "noPool",
            "type": "pubkey"
          },
          {
            "name": "yesMint",
            "type": "pubkey"
          },
          {
            "name": "noMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "poolsClosedEventV2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topicId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "yesPool",
            "type": "pubkey"
          },
          {
            "name": "noPool",
            "type": "pubkey"
          },
          {
            "name": "yesMint",
            "type": "pubkey"
          },
          {
            "name": "noMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "receipt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "strategyId",
            "type": "u8"
          },
          {
            "name": "principal",
            "type": "u64"
          },
          {
            "name": "interest",
            "type": "u64"
          },
          {
            "name": "lastSettleTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "redeemEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "isWinningToken",
            "type": "bool"
          },
          {
            "name": "usdbAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "strategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "strategyId",
            "type": "u8"
          },
          {
            "name": "eventType",
            "type": {
              "defined": {
                "name": "strategyEventType"
              }
            }
          },
          {
            "name": "usedPrincipalPercent",
            "type": "u8"
          },
          {
            "name": "apr",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "strategyEventType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "added"
          },
          {
            "name": "toggled"
          },
          {
            "name": "aprUpdated"
          }
        ]
      }
    },
    {
      "name": "strategyState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u8"
          },
          {
            "name": "usedPrincipalPercent",
            "type": "u8"
          },
          {
            "name": "apr",
            "type": "u16"
          },
          {
            "name": "totalPrincipal",
            "type": "u64"
          },
          {
            "name": "totalInterest",
            "type": "u64"
          },
          {
            "name": "totalUser",
            "type": "u64"
          },
          {
            "name": "lastUpdateTs",
            "type": "i64"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "swapEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "isYesPool",
            "type": "bool"
          },
          {
            "name": "isTokenToUsdb",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "topic",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topicId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "yesMint",
            "type": "pubkey"
          },
          {
            "name": "noMint",
            "type": "pubkey"
          },
          {
            "name": "yesPool",
            "type": "pubkey"
          },
          {
            "name": "noPool",
            "type": "pubkey"
          },
          {
            "name": "toltalToken",
            "type": "u64"
          },
          {
            "name": "initialPrice",
            "type": "u64"
          },
          {
            "name": "isEnded",
            "type": "bool"
          },
          {
            "name": "winningToken",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "topicIpfsHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "topicEndedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "topic",
            "type": "pubkey"
          },
          {
            "name": "oracle",
            "type": "pubkey"
          },
          {
            "name": "oracleAdmin",
            "type": "pubkey"
          },
          {
            "name": "winningToken",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "usdbMintUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "newUsdbMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "usdbMint",
            "type": "pubkey"
          },
          {
            "name": "totalAllPrincipal",
            "type": "u64"
          },
          {
            "name": "totalAllInterest",
            "type": "u64"
          },
          {
            "name": "availableFunds",
            "type": "u64"
          },
          {
            "name": "remainingFunds",
            "type": "u64"
          },
          {
            "name": "guaranteeFunds",
            "type": "u64"
          },
          {
            "name": "lastSettleTs",
            "type": "i64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "withdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "principal",
            "type": "u64"
          },
          {
            "name": "interest",
            "type": "u64"
          },
          {
            "name": "remainingPrincipal",
            "type": "u64"
          },
          {
            "name": "remainingInterest",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
