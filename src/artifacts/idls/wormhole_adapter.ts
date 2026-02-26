export type WormholeAdapter = {
  address: "mzp1q2j5Hr1QuLC3KFBCAUz5aUckT6qyuZKZ3WJnMmY";
  metadata: {
    name: "wormholeAdapter";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "acceptAdmin";
      discriminator: [112, 42, 45, 90, 116, 181, 13, 170];
      accounts: [
        {
          name: "pendingAdmin";
          signer: true;
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "cancelAdminTransfer";
      discriminator: [38, 131, 157, 31, 240, 137, 44, 215];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "initialize";
      docs: ["Admin Instructions"];
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: "mMint";
          writable: true;
        },
        {
          name: "oldTokenAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "newTokenAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
            ];
            program: {
              kind: "const";
              value: [
                5,
                96,
                71,
                38,
                195,
                17,
                0,
                131,
                79,
                49,
                225,
                51,
                140,
                91,
                229,
                193,
                101,
                155,
                214,
                243,
                111,
                176,
                88,
                151,
                248,
                178,
                69,
                151,
                27,
                53,
                202,
                23,
              ];
            };
          };
        },
        {
          name: "tokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "chainId";
          type: "u32";
        },
      ];
    },
    {
      name: "pauseIncoming";
      discriminator: [159, 50, 214, 15, 183, 226, 174, 196];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "pauseOutgoing";
      discriminator: [254, 51, 37, 160, 105, 61, 204, 223];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "proposeAdmin";
      discriminator: [121, 214, 199, 212, 87, 39, 117, 234];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "newAdmin";
          type: "pubkey";
        },
      ];
    },
    {
      name: "receiveMessage";
      docs: ["Inbound Instructions"];
      discriminator: [38, 144, 127, 225, 31, 225, 238, 25];
      accounts: [
        {
          name: "relayer";
          writable: true;
          signer: true;
        },
        {
          name: "wormholeGlobal";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: "portalGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
            program: {
              kind: "const";
              value: [
                5,
                96,
                71,
                38,
                195,
                17,
                0,
                131,
                79,
                49,
                225,
                51,
                140,
                91,
                229,
                193,
                101,
                155,
                214,
                243,
                111,
                176,
                88,
                151,
                248,
                178,
                69,
                151,
                27,
                53,
                202,
                23,
              ];
            };
          };
        },
        {
          name: "wormholeAdapterAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
            ];
          };
        },
        {
          name: "portalAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
            ];
            program: {
              kind: "const";
              value: [
                5,
                96,
                71,
                38,
                195,
                17,
                0,
                131,
                79,
                49,
                225,
                51,
                140,
                91,
                229,
                193,
                101,
                155,
                214,
                243,
                111,
                176,
                88,
                151,
                248,
                178,
                69,
                151,
                27,
                53,
                202,
                23,
              ];
            };
          };
        },
        {
          name: "messageAccount";
          writable: true;
        },
        {
          name: "guardianSet";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [71, 117, 97, 114, 100, 105, 97, 110, 83, 101, 116];
              },
              {
                kind: "arg";
                path: "guardianSetIndex";
              },
            ];
            program: {
              kind: "const";
              value: [
                14,
                10,
                88,
                154,
                65,
                165,
                95,
                189,
                102,
                197,
                42,
                71,
                95,
                45,
                146,
                166,
                211,
                220,
                155,
                71,
                71,
                17,
                76,
                185,
                175,
                130,
                90,
                152,
                181,
                69,
                211,
                206,
              ];
            };
          };
        },
        {
          name: "guardianSignatures";
        },
        {
          name: "wormholeVerifyVaaShim";
          address: "EFaNWErqAtVWufdNb7yofSHHfWFos843DFpu4JBw24at";
        },
        {
          name: "earnGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
            program: {
              kind: "const";
              value: [
                11,
                134,
                11,
                7,
                229,
                245,
                33,
                49,
                225,
                170,
                183,
                171,
                210,
                177,
                147,
                110,
                166,
                55,
                182,
                49,
                97,
                242,
                35,
                170,
                152,
                135,
                152,
                108,
                102,
                78,
                112,
                208,
              ];
            };
          };
        },
        {
          name: "mMint";
          writable: true;
        },
        {
          name: "mTokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "earnProgram";
          address: "mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z";
        },
        {
          name: "portalProgram";
          address: "MzBrgc8yXBj4P16GTkcSyDZkEQZB9qDqf3fh9bByJce";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "guardianSetIndex";
          type: "u32";
        },
        {
          name: "vaaBody";
          type: "bytes";
        },
      ];
    },
    {
      name: "resolveExecute";
      discriminator: [148, 184, 169, 222, 207, 8, 154, 127];
      accounts: [];
      args: [
        {
          name: "vaaBody";
          type: "bytes";
        },
      ];
      returns: {
        defined: {
          name: "resolver";
          generics: [
            {
              kind: "type";
              type: {
                defined: {
                  name: "instructionGroups";
                };
              };
            },
          ];
        };
      };
    },
    {
      name: "sendMessage";
      docs: ["Outbound Instructions"];
      discriminator: [57, 40, 34, 178, 189, 10, 65, 26];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "wormholeGlobal";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: "portalGlobal";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
            program: {
              kind: "const";
              value: [
                5,
                96,
                71,
                38,
                195,
                17,
                0,
                131,
                79,
                49,
                225,
                51,
                140,
                91,
                229,
                193,
                101,
                155,
                214,
                243,
                111,
                176,
                88,
                151,
                248,
                178,
                69,
                151,
                27,
                53,
                202,
                23,
              ];
            };
          };
        },
        {
          name: "portalAuthority";
          docs: ["Only relay messages coming from the Portal"];
          signer: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
            ];
            program: {
              kind: "const";
              value: [
                5,
                96,
                71,
                38,
                195,
                17,
                0,
                131,
                79,
                49,
                225,
                51,
                140,
                91,
                229,
                193,
                101,
                155,
                214,
                243,
                111,
                176,
                88,
                151,
                248,
                178,
                69,
                151,
                27,
                53,
                202,
                23,
              ];
            };
          };
        },
        {
          name: "bridge";
          writable: true;
          address: "2yVjuQwpsvdsrywzsJJVs9Ueh4zayyo5DYJbBNc3DDpn";
        },
        {
          name: "message";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "emitter";
              },
            ];
            program: {
              kind: "const";
              value: [
                206,
                93,
                34,
                116,
                131,
                143,
                202,
                41,
                198,
                209,
                143,
                152,
                10,
                211,
                213,
                245,
                235,
                78,
                129,
                210,
                121,
                29,
                243,
                98,
                128,
                136,
                144,
                147,
                38,
                68,
                208,
                24,
              ];
            };
          };
        },
        {
          name: "emitter";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 109, 105, 116, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "sequence";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [83, 101, 113, 117, 101, 110, 99, 101];
              },
              {
                kind: "account";
                path: "emitter";
              },
            ];
            program: {
              kind: "const";
              value: [
                14,
                10,
                88,
                154,
                65,
                165,
                95,
                189,
                102,
                197,
                42,
                71,
                95,
                45,
                146,
                166,
                211,
                220,
                155,
                71,
                71,
                17,
                76,
                185,
                175,
                130,
                90,
                152,
                181,
                69,
                211,
                206,
              ];
            };
          };
        },
        {
          name: "feeCollector";
          writable: true;
          address: "9bFNrXNb2WTx8fMHXCheaZqkLZ3YCCaiqTftHxeintHy";
        },
        {
          name: "clock";
          address: "SysvarC1ock11111111111111111111111111111111";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "wormholeProgram";
          address: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth";
        },
        {
          name: "wormholePostMessageShimEa";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
            program: {
              kind: "const";
              value: [
                206,
                93,
                34,
                116,
                131,
                143,
                202,
                41,
                198,
                209,
                143,
                152,
                10,
                211,
                213,
                245,
                235,
                78,
                129,
                210,
                121,
                29,
                243,
                98,
                128,
                136,
                144,
                147,
                38,
                68,
                208,
                24,
              ];
            };
          };
        },
        {
          name: "wormholePostMessageShim";
          address: "EtZMZM22ViKMo4r5y4Anovs3wKQ2owUmDpjygnMMcdEX";
        },
      ];
      args: [
        {
          name: "m0DestinationChainId";
          type: "u32";
        },
        {
          name: "messageId";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "payload";
          type: "bytes";
        },
        {
          name: "payloadType";
          type: "u8";
        },
      ];
    },
    {
      name: "setLut";
      discriminator: [94, 88, 132, 249, 103, 48, 167, 202];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: "portalGlobal";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
            program: {
              kind: "const";
              value: [
                5,
                96,
                71,
                38,
                195,
                17,
                0,
                131,
                79,
                49,
                225,
                51,
                140,
                91,
                229,
                193,
                101,
                155,
                214,
                243,
                111,
                176,
                88,
                151,
                248,
                178,
                69,
                151,
                27,
                53,
                202,
                23,
              ];
            };
          };
        },
        {
          name: "lutAddress";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "wormholeGlobal";
              },
              {
                kind: "arg";
                path: "recentSlot";
              },
            ];
            program: {
              kind: "account";
              path: "lutProgram";
            };
          };
        },
        {
          name: "lutProgram";
          address: "AddressLookupTab1e1111111111111111111111111";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "recentSlot";
          type: "u64";
        },
      ];
    },
    {
      name: "setPeer";
      discriminator: [32, 70, 184, 229, 200, 115, 227, 177];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "peer";
          type: {
            defined: {
              name: "peer";
            };
          };
        },
      ];
    },
    {
      name: "unpauseIncoming";
      discriminator: [40, 3, 144, 42, 253, 44, 153, 249];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "unpauseOutgoing";
      discriminator: [255, 24, 174, 235, 25, 115, 35, 11];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["wormholeGlobal"];
        },
        {
          name: "wormholeGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "earnGlobal";
      discriminator: [229, 50, 25, 132, 207, 93, 185, 23];
    },
    {
      name: "portalGlobal";
      discriminator: [83, 250, 129, 21, 172, 135, 20, 236];
    },
    {
      name: "wormholeGlobal";
      discriminator: [116, 100, 187, 174, 88, 1, 91, 250];
    },
  ];
  events: [
    {
      name: "peerSet";
      discriminator: [27, 114, 255, 165, 25, 240, 245, 93];
    },
  ];
  types: [
    {
      name: "earnGlobal";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "mMint";
            type: "pubkey";
          },
          {
            name: "portalAuthority";
            type: "pubkey";
          },
          {
            name: "extSwapGlobalAccount";
            type: "pubkey";
          },
          {
            name: "earnerMerkleRoot";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "bump";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "instructionGroup";
      type: {
        kind: "struct";
        fields: [
          {
            name: "instructions";
            type: {
              vec: {
                defined: {
                  name: "serializableInstruction";
                };
              };
            };
          },
          {
            name: "addressLookupTables";
            type: {
              vec: "pubkey";
            };
          },
        ];
      };
    },
    {
      name: "instructionGroups";
      type: {
        kind: "struct";
        fields: [
          {
            vec: {
              defined: {
                name: "instructionGroup";
              };
            };
          },
        ];
      };
    },
    {
      name: "missingAccounts";
      type: {
        kind: "struct";
        fields: [
          {
            name: "accounts";
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "addressLookupTables";
            type: {
              vec: "pubkey";
            };
          },
        ];
      };
    },
    {
      name: "peer";
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "m0ChainId";
            type: "u32";
          },
          {
            name: "adapterChainId";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "peerSet";
      type: {
        kind: "struct";
        fields: [
          {
            name: "m0ChainId";
            type: "u32";
          },
          {
            name: "wormholeChainId";
            type: "u32";
          },
          {
            name: "peer";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "peers";
      type: {
        kind: "struct";
        fields: [
          {
            vec: {
              defined: {
                name: "peer";
              };
            };
          },
        ];
      };
    },
    {
      name: "portalGlobal";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "chainId";
            type: "u32";
          },
          {
            name: "mMint";
            type: "pubkey";
          },
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "outgoingPaused";
            type: "bool";
          },
          {
            name: "incomingPaused";
            type: "bool";
          },
          {
            name: "mIndex";
            type: "u128";
          },
          {
            name: "messageNonce";
            type: "u64";
          },
          {
            name: "pendingAdmin";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "isolatedHubChainId";
            type: {
              option: "u32";
            };
          },
          {
            name: "unclaimedMBalance";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 120];
            };
          },
        ];
      };
    },
    {
      name: "resolver";
      generics: [
        {
          kind: "type";
          name: "t";
        },
      ];
      type: {
        kind: "enum";
        variants: [
          {
            name: "resolved";
            fields: [
              {
                generic: "t";
              },
            ];
          },
          {
            name: "missing";
            fields: [
              {
                defined: {
                  name: "missingAccounts";
                };
              },
            ];
          },
          {
            name: "account";
            fields: [];
          },
        ];
      };
    },
    {
      name: "serializableAccountMeta";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pubkey";
            type: "pubkey";
          },
          {
            name: "isSigner";
            type: "bool";
          },
          {
            name: "isWritable";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "serializableInstruction";
      type: {
        kind: "struct";
        fields: [
          {
            name: "programId";
            type: "pubkey";
          },
          {
            name: "accounts";
            type: {
              vec: {
                defined: {
                  name: "serializableAccountMeta";
                };
              };
            };
          },
          {
            name: "data";
            type: "bytes";
          },
        ];
      };
    },
    {
      name: "wormholeGlobal";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "outgoingPaused";
            type: "bool";
          },
          {
            name: "incomingPaused";
            type: "bool";
          },
          {
            name: "chainId";
            type: "u32";
          },
          {
            name: "receiveLut";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "pendingAdmin";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "peers";
            type: {
              defined: {
                name: "peers";
              };
            };
          },
          {
            name: "padding";
            type: {
              array: ["u8", 128];
            };
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: "authoritySeed";
      type: "bytes";
      value: "[97, 117, 116, 104, 111, 114, 105, 116, 121]";
    },
    {
      name: "emitterSeed";
      type: "bytes";
      value: "[101, 109, 105, 116, 116, 101, 114]";
    },
    {
      name: "eventAuthoritySeed";
      type: "bytes";
      value: "[95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121]";
    },
    {
      name: "globalSeed";
      type: "bytes";
      value: "[103, 108, 111, 98, 97, 108]";
    },
    {
      name: "guardianSetSeed";
      type: "bytes";
      value: "[71, 117, 97, 114, 100, 105, 97, 110, 83, 101, 116]";
    },
    {
      name: "sequenceSeed";
      type: "bytes";
      value: "[83, 101, 113, 117, 101, 110, 99, 101]";
    },
  ];
};
