export type Portal = {
  address: "MzBrgc8yXBj4P16GTkcSyDZkEQZB9qDqf3fh9bByJce";
  metadata: {
    name: "portal";
    version: "0.1.0";
    spec: "0.1.0";
    description: "bridge program that interacts with bridge adapters";
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
          name: "portalGlobal";
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
      name: "addBridgePaths";
      discriminator: [55, 71, 77, 148, 164, 233, 15, 185];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          relations: ["portalGlobal"];
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
          };
        },
        {
          name: "chainPaths";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 104, 97, 105, 110, 95, 112, 97, 116, 104, 115];
              },
              {
                kind: "arg";
                path: "destinationChainId";
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
          name: "destinationChainId";
          type: "u32";
        },
        {
          name: "paths";
          type: {
            vec: {
              defined: {
                name: "bridgePath";
              };
            };
          };
        },
      ];
    },
    {
      name: "cancelAdminTransfer";
      discriminator: [38, 131, 157, 31, 240, 137, 44, 215];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["portalGlobal"];
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
          };
        },
      ];
      args: [];
    },
    {
      name: "enableCrossSpokeTransfers";
      discriminator: [14, 140, 28, 89, 160, 182, 179, 141];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["portalGlobal"];
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
          name: "portalGlobal";
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
          name: "earnGlobal";
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
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "chainId";
          type: "u32";
        },
        {
          name: "isolatedHubChainId";
          type: {
            option: "u32";
          };
        },
      ];
    },
    {
      name: "initializeBridgePaths";
      docs: ["Bridge Path Configuration Instructions"];
      discriminator: [88, 20, 96, 22, 169, 6, 26, 82];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          relations: ["portalGlobal"];
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
          };
        },
        {
          name: "chainPaths";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 104, 97, 105, 110, 95, 112, 97, 116, 104, 115];
              },
              {
                kind: "arg";
                path: "destinationChainId";
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
          name: "destinationChainId";
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
          relations: ["portalGlobal"];
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
          relations: ["portalGlobal"];
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
          relations: ["portalGlobal"];
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
          name: "payer";
          writable: true;
          signer: true;
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
          };
        },
        {
          name: "adapterAuthority";
          signer: true;
        },
        {
          name: "messageAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 115, 115, 97, 103, 101];
              },
              {
                kind: "arg";
                path: "messageId";
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
          };
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
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "messageId";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "sourceChainId";
          type: "u32";
        },
        {
          name: "payload";
          type: "bytes";
        },
      ];
    },
    {
      name: "removeBridgePath";
      discriminator: [72, 202, 104, 24, 227, 65, 72, 4];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          relations: ["portalGlobal"];
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
          };
        },
        {
          name: "chainPaths";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 104, 97, 105, 110, 95, 112, 97, 116, 104, 115];
              },
              {
                kind: "arg";
                path: "destinationChainId";
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
          name: "destinationChainId";
          type: "u32";
        },
        {
          name: "path";
          type: {
            defined: {
              name: "bridgePath";
            };
          };
        },
      ];
    },
    {
      name: "sendCancelReport";
      discriminator: [104, 117, 129, 240, 158, 223, 191, 180];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
        },
        {
          name: "orderBookGlobal";
          docs: ["Only order_book can send fill reports"];
          writable: true;
          signer: true;
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
                115,
                204,
                66,
                167,
                34,
                205,
                173,
                199,
                58,
                223,
                176,
                231,
                81,
                240,
                166,
                247,
                251,
                65,
                73,
                214,
                228,
                4,
                158,
                133,
                255,
                10,
                15,
                109,
                72,
                196,
              ];
            };
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
          };
        },
        {
          name: "bridgeAdapter";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "orderId";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "orderSender";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "tokenIn";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "amountInToRefund";
          type: "u128";
        },
        {
          name: "originChainId";
          type: "u32";
        },
      ];
    },
    {
      name: "sendFillReport";
      discriminator: [100, 127, 155, 94, 233, 58, 141, 240];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
        },
        {
          name: "orderBookGlobal";
          docs: ["Only order_book can send fill reports"];
          writable: true;
          signer: true;
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
                115,
                204,
                66,
                167,
                34,
                205,
                173,
                199,
                58,
                223,
                176,
                231,
                81,
                240,
                166,
                247,
                251,
                65,
                73,
                214,
                228,
                4,
                158,
                133,
                255,
                10,
                15,
                109,
                72,
                196,
              ];
            };
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
          };
        },
        {
          name: "bridgeAdapter";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "orderId";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "tokenIn";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "amountInToRelease";
          type: "u128";
        },
        {
          name: "amountOutFilled";
          type: "u128";
        },
        {
          name: "originRecipient";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "originChainId";
          type: "u32";
        },
      ];
    },
    {
      name: "sendIndex";
      docs: ["Outbound Instructions"];
      discriminator: [92, 203, 229, 128, 118, 111, 243, 53];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
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
          };
        },
        {
          name: "bridgeAdapter";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "destinationChainId";
          type: "u32";
        },
      ];
    },
    {
      name: "sendMerkleRoot";
      discriminator: [15, 184, 227, 45, 154, 255, 227, 63];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
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
          };
        },
        {
          name: "earnGlobal";
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
          name: "portalAuthority";
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
          name: "bridgeAdapter";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "destinationChainId";
          type: "u32";
        },
      ];
    },
    {
      name: "sendToken";
      discriminator: [157, 183, 177, 53, 196, 251, 54, 185];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
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
          };
        },
        {
          name: "swapGlobal";
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
                60,
                242,
                167,
                56,
                11,
                17,
                54,
                97,
                114,
                227,
                114,
                39,
                167,
                101,
                13,
                161,
                190,
                235,
                218,
                112,
                220,
                127,
                89,
                126,
                174,
                151,
                23,
                37,
                130,
                35,
                190,
              ];
            };
          };
        },
        {
          name: "chainPaths";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 104, 97, 105, 110, 95, 112, 97, 116, 104, 115];
              },
              {
                kind: "arg";
                path: "destinationChainId";
              },
            ];
          };
        },
        {
          name: "extensionGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
            program: {
              kind: "account";
              path: "extensionProgram";
            };
          };
        },
        {
          name: "mMint";
          writable: true;
          relations: ["portalGlobal"];
        },
        {
          name: "extensionMint";
          writable: true;
        },
        {
          name: "mTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "portalAuthority";
              },
              {
                kind: "account";
                path: "mTokenProgram";
              },
              {
                kind: "account";
                path: "mMint";
              },
            ];
            program: {
              kind: "const";
              value: [
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
                89,
              ];
            };
          };
        },
        {
          name: "extensionTokenAccount";
          writable: true;
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
          };
        },
        {
          name: "extMVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "extMVaultAuth";
              },
              {
                kind: "account";
                path: "mTokenProgram";
              },
              {
                kind: "account";
                path: "mMint";
              },
            ];
            program: {
              kind: "const";
              value: [
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
                89,
              ];
            };
          };
        },
        {
          name: "extMVaultAuth";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 95, 118, 97, 117, 108, 116];
              },
            ];
            program: {
              kind: "account";
              path: "extensionProgram";
            };
          };
        },
        {
          name: "extMintAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  105,
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
              kind: "account";
              path: "extensionProgram";
            };
          };
        },
        {
          name: "swapProgram";
          address: "MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH";
        },
        {
          name: "extensionProgram";
        },
        {
          name: "mTokenProgram";
        },
        {
          name: "extensionTokenProgram";
        },
        {
          name: "bridgeAdapter";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "destinationToken";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "destinationChainId";
          type: "u32";
        },
        {
          name: "recipient";
          type: {
            array: ["u8", 32];
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
          relations: ["portalGlobal"];
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
          relations: ["portalGlobal"];
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
          };
        },
      ];
      args: [];
    },
    {
      name: "wrapUnclaimed";
      discriminator: [123, 209, 241, 179, 169, 75, 253, 250];
      accounts: [
        {
          name: "admin";
          signer: true;
          relations: ["portalGlobal"];
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
          };
        },
        {
          name: "swapGlobal";
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
                60,
                242,
                167,
                56,
                11,
                17,
                54,
                97,
                114,
                227,
                114,
                39,
                167,
                101,
                13,
                161,
                190,
                235,
                218,
                112,
                220,
                127,
                89,
                126,
                174,
                151,
                23,
                37,
                130,
                35,
                190,
              ];
            };
          };
        },
        {
          name: "extensionGlobal";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
            program: {
              kind: "account";
              path: "extensionProgram";
            };
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
          };
        },
        {
          name: "authorityMTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "portalAuthority";
              },
              {
                kind: "account";
                path: "mTokenProgram";
              },
              {
                kind: "account";
                path: "mMint";
              },
            ];
            program: {
              kind: "const";
              value: [
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
                89,
              ];
            };
          };
        },
        {
          name: "mMint";
        },
        {
          name: "extensionMint";
        },
        {
          name: "recipientTokenAccount";
          writable: true;
        },
        {
          name: "extensionMVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "extensionMVaultAuthority";
              },
              {
                kind: "account";
                path: "mTokenProgram";
              },
              {
                kind: "account";
                path: "mMint";
              },
            ];
            program: {
              kind: "const";
              value: [
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
                89,
              ];
            };
          };
        },
        {
          name: "extensionMintAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  105,
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
              kind: "account";
              path: "extensionProgram";
            };
          };
        },
        {
          name: "extensionMVaultAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 95, 118, 97, 117, 108, 116];
              },
            ];
            program: {
              kind: "account";
              path: "extensionProgram";
            };
          };
        },
        {
          name: "mTokenProgram";
        },
        {
          name: "extensionTokenProgram";
        },
        {
          name: "extensionProgram";
        },
        {
          name: "swapProgram";
          address: "MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: {
            option: "u64";
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: "bridgeMessage";
      discriminator: [246, 111, 156, 126, 81, 14, 238, 152];
    },
    {
      name: "chainBridgePaths";
      discriminator: [89, 30, 178, 53, 154, 232, 75, 140];
    },
    {
      name: "earnGlobal";
      discriminator: [229, 50, 25, 132, 207, 93, 185, 23];
    },
    {
      name: "portalGlobal";
      discriminator: [83, 250, 129, 21, 172, 135, 20, 236];
    },
    {
      name: "swapGlobal";
      discriminator: [15, 184, 147, 129, 183, 219, 223, 163];
    },
  ];
  events: [
    {
      name: "bridgePathAdded";
      discriminator: [60, 60, 161, 230, 207, 42, 101, 174];
    },
    {
      name: "bridgePathRemoved";
      discriminator: [245, 243, 242, 225, 230, 129, 158, 165];
    },
    {
      name: "cancelReportReceived";
      discriminator: [139, 163, 1, 52, 99, 85, 7, 143];
    },
    {
      name: "cancelReportSent";
      discriminator: [7, 35, 17, 164, 221, 120, 12, 31];
    },
    {
      name: "chainPathsInitialized";
      discriminator: [182, 96, 36, 123, 226, 44, 109, 244];
    },
    {
      name: "fillReportReceived";
      discriminator: [101, 71, 41, 220, 125, 65, 44, 48];
    },
    {
      name: "fillReportSent";
      discriminator: [127, 44, 168, 99, 163, 152, 5, 94];
    },
    {
      name: "mBalanceClaimed";
      discriminator: [243, 168, 124, 70, 238, 205, 79, 145];
    },
    {
      name: "mBalanceStored";
      discriminator: [123, 28, 142, 205, 171, 228, 140, 219];
    },
    {
      name: "mTokenIndexReceived";
      discriminator: [8, 176, 76, 78, 200, 62, 28, 142];
    },
    {
      name: "tokenReceived";
      discriminator: [251, 126, 204, 211, 2, 159, 194, 227];
    },
    {
      name: "tokenSent";
      discriminator: [1, 10, 12, 13, 206, 47, 175, 162];
    },
  ];
  types: [
    {
      name: "bridgeMessage";
      type: {
        kind: "struct";
        fields: [
          {
            name: "consumed";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "bridgePath";
      docs: [
        "Represents an allowed bridging path from a source token to a destination token",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "sourceMint";
            docs: ["Extension mint on Solana (e.g., wM mint pubkey)"];
            type: "pubkey";
          },
          {
            name: "destinationToken";
            docs: [
              "Token address on destination chain (e.g., Ethereum wM address)",
            ];
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "bridgePathAdded";
      type: {
        kind: "struct";
        fields: [
          {
            name: "destinationChainId";
            type: "u32";
          },
          {
            name: "sourceMint";
            type: "pubkey";
          },
          {
            name: "destinationToken";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "bridgePathRemoved";
      type: {
        kind: "struct";
        fields: [
          {
            name: "destinationChainId";
            type: "u32";
          },
          {
            name: "sourceMint";
            type: "pubkey";
          },
          {
            name: "destinationToken";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "cancelReportReceived";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sourceChainId";
            type: "u32";
          },
          {
            name: "bridgeAdapter";
            type: "pubkey";
          },
          {
            name: "orderId";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "orderSender";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "tokenIn";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amountInToRefund";
            type: "u128";
          },
          {
            name: "messageId";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "cancelReportSent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "destinationChainId";
            type: "u32";
          },
          {
            name: "bridgeAdapter";
            type: "pubkey";
          },
          {
            name: "orderId";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "orderSender";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "tokenIn";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amountInToRefund";
            type: "u128";
          },
        ];
      };
    },
    {
      name: "chainBridgePaths";
      docs: ["Per-destination-chain configuration of allowed bridging paths"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "destinationChainId";
            type: "u32";
          },
          {
            name: "paths";
            type: {
              vec: {
                defined: {
                  name: "bridgePath";
                };
              };
            };
          },
        ];
      };
    },
    {
      name: "chainPathsInitialized";
      type: {
        kind: "struct";
        fields: [
          {
            name: "destinationChainId";
            type: "u32";
          },
        ];
      };
    },
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
      name: "fillReportReceived";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sourceChainId";
            type: "u32";
          },
          {
            name: "bridgeAdapter";
            type: "pubkey";
          },
          {
            name: "orderId";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amountInToRelease";
            type: "u128";
          },
          {
            name: "amountOutFilled";
            type: "u128";
          },
          {
            name: "originRecipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "tokenIn";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "messageId";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "fillReportSent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "destinationChainId";
            type: "u32";
          },
          {
            name: "bridgeAdapter";
            type: "pubkey";
          },
          {
            name: "orderId";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amountInToRelease";
            type: "u128";
          },
          {
            name: "amountOutFilled";
            type: "u128";
          },
          {
            name: "originRecipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "tokenIn";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "mBalanceClaimed";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "destination";
            type: "pubkey";
          },
          {
            name: "remainingUnclaimed";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "mBalanceStored";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sourceChainId";
            type: "u32";
          },
          {
            name: "destinationToken";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "sender";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "recipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "principalAmount";
            type: "u64";
          },
          {
            name: "messageId";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "mTokenIndexReceived";
      type: {
        kind: "struct";
        fields: [
          {
            name: "index";
            type: "u128";
          },
          {
            name: "messageId";
            type: {
              array: ["u8", 32];
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
            docs: ["The lastest index value to propagate to other chains"];
            type: "u128";
          },
          {
            name: "messageNonce";
            docs: ["To ensure bridge message ID uniqueness"];
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
            docs: ["This portal is an isolated spoke"];
            type: {
              option: "u32";
            };
          },
          {
            name: "unclaimedMBalance";
            docs: [
              "Aggregate principal amount of M tokens stored when destination_token is not whitelisted",
            ];
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
      name: "swapGlobal";
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
            name: "whitelistedUnwrappers";
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "whitelistedExtensions";
            type: {
              vec: {
                defined: {
                  name: "whitelistedExtension";
                };
              };
            };
          },
        ];
      };
    },
    {
      name: "tokenReceived";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sourceChainId";
            type: "u32";
          },
          {
            name: "bridgeAdapter";
            type: "pubkey";
          },
          {
            name: "destinationToken";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "sender";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "recipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amount";
            type: "u128";
          },
          {
            name: "messageId";
            type: {
              array: ["u8", 32];
            };
          },
        ];
      };
    },
    {
      name: "tokenSent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sourceToken";
            type: "pubkey";
          },
          {
            name: "destinationChainId";
            type: "u32";
          },
          {
            name: "destinationToken";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "sender";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "amount";
            type: "u128";
          },
          {
            name: "index";
            type: "u128";
          },
          {
            name: "bridgeAdapter";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "whitelistedExtension";
      type: {
        kind: "struct";
        fields: [
          {
            name: "programId";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "tokenProgram";
            type: "pubkey";
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: "chainPathsSeed";
      type: "bytes";
      value: "[99, 104, 97, 105, 110, 95, 112, 97, 116, 104, 115]";
    },
    {
      name: "globalSeed";
      type: "bytes";
      value: "[103, 108, 111, 98, 97, 108]";
    },
    {
      name: "messageSeed";
      type: "bytes";
      value: "[109, 101, 115, 115, 97, 103, 101]";
    },
    {
      name: "mintAuthoritySeed";
      type: "bytes";
      value: "[109, 105, 110, 116, 95, 97, 117, 116, 104, 111, 114, 105, 116, 121]";
    },
    {
      name: "mVaultSeed";
      type: "bytes";
      value: "[109, 95, 118, 97, 117, 108, 116]";
    },
  ];
};
