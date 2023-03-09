const textLibrary = {
    // mnemonics: {
    //   'JNZ': 'JNZ info',
    //   'JMP': 'JMP info'
    // }
    mnemonics: {
        'ADD': {
          description: 'Computes the sum of <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> and <span class="ff-monospace">ACCUMULATOR</span>',
          args: [
            {
              description: 'The number to be added to <span class="ff-monospace">ACCUMULATOR</span>',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {
            Overflow: 'raised when the resultant sum is greater than the maximum value, based on the register size',
            RegisterSizeMismatch: 'Raised when the size of <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> is not equal to the size of <span class="ff-monospace">ACCUMULATOR</span>'
          }
        },
        'SUB': {
          description: 'Computes the difference of <span class="ff-monospace">ACCUMULATOR</span> and <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The number to be subtracted from <span class="ff-monospace">ACCUMULATOR</span>',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {
            Underflow: 'raised when the resultant difference is nominally less than zero',
            RegisterSizeMismatch: 'Raised when the size of <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> is not equal to the size of <span class="ff-monospace">ACCUMULATOR</span>'
          }
        },
        'MULT': {
          description: 'Computes the product of <span class="ff-monospace">ACCUMULATOR</span> and <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The number by which to multiply <span class="ff-monospace">ACCUMULATOR</span>',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {}
        },
        'DIV': {
          description: 'Computes the (integer) quotient of <span class="ff-monospace">ACCUMULATOR</span> and <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The number by which to divide <span class="ff-monospace">ACCUMULATOR</span>',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {}
        },
        'MOD': {
          description: '',
          args: [],
          flags: {}
        },
        'MEMREAD': {
          description: '',
          args: [],
          flags: {}
        },
        'MEMREAD_Q': {
          description: '',
          args: [],
          flags: {}
        },
        'MEMREAD_X': {
          description: '',
          args: [],
          flags: {}
        },
        'MEMREAD_D': {
          description: '',
          args: [],
          flags: {}
        },
        'MEMWRITE': {
          description: 'Writes the byte value stored in <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> to memory at the address specified in <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The address to be written to',
              dataType: 'regref-full',
              lexicalType: 'address',
              name: 'address'
            },
            {
              description: 'The value to be written',
              dataType: 'regref-byte',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {
            OutOfBounds: 'Raised if the computer\'s total memory size is less than <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span>',
            RegisterSizeMismatch: 'Raised if <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> is not a quad register reference or <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> is not a byte register reference'
          }
        },
        'MEMWRITE_Q': {
          description: 'Writes the quad byte value stored in <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> to memory at the address specified in <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The start address to be written to',
              dataType: 'regref-full',
              lexicalType: 'address',
              name: 'address'
            },
            {
              description: 'The value to be written',
              dataType: 'regref-full',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {
            OutOfBounds: 'Raised if the computer\'s total memory size is less than <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> + 4',
            RegisterSizeMismatch: 'Raised if either <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> or <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> is not a quad register reference'
          }
        },
        'MEMWRITE_X': {
          description: 'Writes the triple byte value stored in <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> to memory beginning at the address specified in <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The start address to be written to',
              dataType: 'regref-full',
              lexicalType: 'address',
              name: 'address'
            },
            {
              description: 'The value to be written',
              dataType: 'regref-tri',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {
            OutOfBounds: 'Raised if the computer\'s total memory size is less than <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> + 3',
            RegisterSizeMismatch: 'Raised if <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> is not a quad register reference or <span class="ff-monospace"><span class="generic-arg-name">value</span><span class="resolved-arg-name">TODO</span></span> is not a triple byte register reference'
          }
        },
        'MEMWRITE_D': {
          description: 'Writes the double byte value stored in <span class="ff-monospace"><span class="generic-arg-name"></span><span class="resolved-arg-name">TODO</span></span> to memory beginning at the address specified in <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'The start address to be written to',
              dataType: 'regref-full',
              lexicalType: 'address',
              name: 'address'
            },
            {
              description: 'The value to be written',
              dataType: 'regref-double',
              lexicalType: 'integer',
              name: ''
            }
          ],
          flags: {
            OutOfBounds: 'Raised if the computer\'s total memory size is less than <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> + 2',
            RegisterSizeMismatch: 'Raised if <span class="ff-monospace"><span class="generic-arg-name">address</span><span class="resolved-arg-name">TODO</span></span> is not a quad register reference or <span class="ff-monospace"><span class="generic-arg-name"></span><span class="resolved-arg-name">TODO</span></span> is not a double byte register reference'
          }
        },
        'LOAD_MONDAY': {
          description: 'Sets the value of <span class="ff-monospace">MONDAY</span> to the provided value',
          args: [
            {
              description: 'The value to write into <span class="ff-monospace">MONDAY</span>',
              dataType: 'inline-quad',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {}
        },
        'LOAD_TUESDAY': {
          description: 'Sets the value of <span class="ff-monospace">TUESDAY</span> to the provided value',
          args: [
            {
              description: 'The value to write into <span class="ff-monospace">TUESDAY</span>',
              dataType: 'inline-quad',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {}
        },
        'LOAD_WEDNESDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_THURSDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_FRIDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_ACCUMULATOR': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_INSPTR': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G7': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G8': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G9': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G10': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G11': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G12': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G13': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G14': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_G15': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_MONDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_TUESDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_WEDNESDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_THURSDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_FRIDAY': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_ACCUMULATOR': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_INSPTR': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G7': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G8': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G9': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G10': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G11': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G12': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G13': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G14': {
          description: '',
          args: [],
          flags: {}
        },
        'SAVE_G15': {
          description: '',
          args: [],
          flags: {}
        },
        'COPY': {
          description: 'Writes the value of <span class="ff-monospace"><span class="generic-arg-name">copyFrom</span><span class="resolved-arg-name">TODO</span></span> into <span class="ff-monospace"><span class="generic-arg-name">copyTo</span><span class="resolved-arg-name">TODO</span></span>.\nThe registers must be the same size.',
          args: [
            {
              description: 'The register from which to copy the value',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'copyFrom'
            },
            {
              description: 'The register to be updated with the copied value',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'copyTo'
            }
          ],
          flags: {}
        },
        'INC': {
          description: 'Adds 1 to the specified register',
          args: [
            {
              description: 'The register to be incremented',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'register'
            }
          ],
          flags: {}
        },
        'DEC': {
          description: 'Subtracts 1 from the specified register',
          args: [
            {
              description: 'The register to be decremented',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'register'
            }
          ],
          flags: {}
        },
        'BITAND': {
          description: 'Computes the bitwise AND value of <span class="ff-monospace">ACCUMULATOR</span> and the provided register',
          args: [
            {
              description: 'The value with which to compute the bitwise AND',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {}
        },
        'BITOR': {
          description: 'Computes the bitwise OR value of <span class="ff-monospace">ACCUMULATOR</span> and the provided register',
          args: [
            {
              description: 'The value with which to compute the bitwise OR',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'value'
            }
          ],
          flags: {}
        },
        'BITXOR': {
          description: '',
          args: [],
          flags: {}
        },
        'BITLSHIFT': {
          description: '',
          args: [],
          flags: {}
        },
        'BITRSHIFT': {
          description: '',
          args: [],
          flags: {}
        },
        'BITNOT': {
          description: '',
          args: [],
          flags: {}
        },
        'EQ': {
          description: '',
          args: [],
          flags: {}
        },
        'GT': {
          description: '',
          args: [],
          flags: {}
        },
        'LT': {
          description: '',
          args: [],
          flags: {}
        },
        'JMP': {
          description: 'Sets the <span class="ff-monospace">INSTRUCTIONPTR</span> register to the value of the provided address',
          args: [
            {
              description: 'The address to jump to',
              dataType: 'regref-full',
              lexicalType: 'address',
              name: 'address'
            }
          ],
          flags: {}
        },
        'JNZ': {
          description: 'Sets the <span class="ff-monospace">INSTRUCTIONPTR</span> register to the value of the provided address if the value of <span class="ff-monospace"><span class="generic-arg-name">condition</span><span class="resolved-arg-name">TODO</span></span> is non-zero',
          args: [
            {
              description: 'The value to compare to zero',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'condition'
            },
            {
              description: 'The address to jump to if the condition is non-zero',
              dataType: 'inline-quad',
              lexicalType: 'address',
              name: 'address'
            }
          ],
          flags: {}
        },
        'JZ': {
          description: 'Sets the <span class="ff-monospace">INSTRUCTIONPTR</span> register to the value of the provided address if the value of <span class="ff-monospace"><span class="generic-arg-name">condition</span><span class="resolved-arg-name">TODO</span></span> is zero',
          args: [
            {
              description: 'The value to compare to zero',
              dataType: 'regref-any',
              lexicalType: 'integer',
              name: 'condition'
            },
            {
              description: 'The address to jump to if the condition is zero',
              dataType: 'inline-quad',
              lexicalType: 'address',
              name: 'address'
            }
          ],
          flags: {}
        },
        'JMPI': {
          description: 'Sets the <span class="ff-monospace">INSTRUCTIONPTR</span> register to the value of the provided address',
          args: [
            {
              description: 'The address to jump to',
              dataType: 'inline-quad',
              lexicalType: 'address',
              name: 'address'
            }
          ],
          flags: {}
        },
        'JNZI': {
          description: '',
          args: [],
          flags: {}
        },
        'JZI': {
          description: '',
          args: [],
          flags: {}
        },
        'ADDF': {
          description: '',
          args: [],
          flags: {}
        },
        'SUBF': {
          description: '',
          args: [],
          flags: {}
        },
        'MULTF': {
          description: '',
          args: [],
          flags: {}
        },
        'DIVF': {
          description: '',
          args: [],
          flags: {}
        },
        'FLOORF': {
          description: '',
          args: [],
          flags: {}
        },
        'CEILF': {
          description: '',
          args: [],
          flags: {}
        },
        'ROUNDF': {
          description: '',
          args: [],
          flags: {}
        },
        'FLAG_ACK': {
          description: '',
          args: [],
          flags: {}
        },
        'ADDV': {
          description: '',
          args: [],
          flags: {}
        },
        'SUBV': {
          description: '',
          args: [],
          flags: {}
        },
        'MULTV': {
          description: '',
          args: [],
          flags: {}
        },
        'DIVV': {
          description: '',
          args: [],
          flags: {}
        },
        'MODV': {
          description: '',
          args: [],
          flags: {}
        },
        'EQV': {
          description: '',
          args: [],
          flags: {}
        },
        'GTV': {
          description: '',
          args: [],
          flags: {}
        },
        'LTV': {
          description: '',
          args: [],
          flags: {}
        },
        'ABSV': {
          description: '',
          args: [],
          flags: {}
        },
        'NEGV': {
          description: '',
          args: [],
          flags: {}
        },
        'VEC': {
          description: '',
          args: [],
          flags: {}
        },
        'VEC_NEG': {
          description: '',
          args: [],
          flags: {}
        },
        'MAG': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_D': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_B': {
          description: '',
          args: [],
          flags: {}
        },
        'LOAD_X': {
          description: '',
          args: [],
          flags: {}
        },
        'NO_OP': {
          description: '',
          args: [],
          flags: {}
        },
        'ISCAN': {
          description: '',
          args: [],
          flags: {}
        },
        'OSCAN': {
          description: '',
          args: [],
          flags: {}
        },
        'IOSTAT': {
          description: '',
          args: [],
          flags: {}
        },
        'IOMAN': {
          description: '',
          args: [],
          flags: {}
        },
        'IOREAD_B': {
          description: '',
          args: [],
          flags: {}
        },
        'IOREAD_D': {
          description: '',
          args: [],
          flags: {}
        },
        'IOREAD_X': {
          description: '',
          args: [],
          flags: {}
        },
        'IOREAD_Q': {
          description: '',
          args: [],
          flags: {}
        },
        'IOWRITE_B': {
          description: '',
          args: [],
          flags: {}
        },
        'IOWRITE_D': {
          description: '',
          args: [],
          flags: {}
        },
        'IOWRITE_X': {
          description: '',
          args: [],
          flags: {}
        },
        'IOWRITE_Q': {
          description: '',
          args: [],
          flags: {}
        },
        'IOFLUSH': {
          description: '',
          args: [],
          flags: {}
        },
        'PERF_INFO': {
          description: '',
          args: [],
          flags: {}
        },
        'MODEL_INFO': {
          description: '',
          args: [],
          flags: {}
        },
        'SERIAL_NUMBER': {
          description: '',
          args: [],
          flags: {}
        },
        'CYCLE_COUNT': {
          description: '',
          args: [],
          flags: {}
        },
        'MEMSIZE': {
          description: 'Gets the total amount of memory available to the computer (in bytes) and places the value in <span class="ff-monospace"><span class="generic-arg-name">destination</span><span class="resolved-arg-name">TODO</span></span>',
          args: [
            {
              description: 'Register in which to store the amount of random access memory available to the computer, in bytes',
              dataType: 'regref-full',
              lexicalType: 'integer',
              name: 'destination'
            }
          ],
          flags: {}
        },
        'END': {
          description: '',
          args: [],
          flags: {}
        }
      }
  }
//   const textLibrary = {
//     // mnemonics: {
//     //   'JNZ': 'JNZ info',
//     //   'JMP': 'JMP info'
//     // }
//     mnemonics: {
//         'JNZ': {
//             description: 'Sets the <span class="ff-monospace">INSTRUCTIONPTR</span> register to the value of the provided address',
//             args: [
//                 {
//                     dataType: 'inline-quad',
//                     lexicalType: 'address',
//                     name: 'destination',
//                     description: 'The address to jump to'
//                 }
//             ]
//         },
//         'JMP': {
//             description: 'Sets the <span class="ff-monospace">INSTRUCTIONPTR</span> register to the value of the provided address',
//             args: [
//                 {
//                     dataType: 'inline-quad',
//                     lexicalType: 'address',
//                     name: 'destination',
//                     description: 'The address to jump to'
//                 }
//             ]
//         }
//     }
//   }

//   ADD,
//     SUB,
//     MULT,
//     DIV,
//     MOD,
//     MEMREAD,
//     MEMREAD_Q,
//     MEMREAD_X,
//     MEMREAD_D,
//     MEMWRITE,
//     MEMWRITE_Q,
//     MEMWRITE_X,
//     MEMWRITE_D,
//     LOAD_MONDAY,
//     LOAD_TUESDAY,
//     LOAD_WEDNESDAY,
//     LOAD_THURSDAY,
//     LOAD_FRIDAY,
//     LOAD_ACCUMULATOR,
//     LOAD_INSPTR,
//     LOAD_G7,
//     LOAD_G8,
//     LOAD_G9,
//     LOAD_G10,
//     LOAD_G11,
//     LOAD_G12,
//     LOAD_G13,
//     LOAD_G14,
//     LOAD_G15,
//     SAVE_MONDAY,
//     SAVE_TUESDAY,
//     SAVE_WEDNESDAY,
//     SAVE_THURSDAY,
//     SAVE_FRIDAY,
//     SAVE_ACCUMULATOR,
//     SAVE_INSPTR,
//     SAVE_G7,
//     SAVE_G8,
//     SAVE_G9,
//     SAVE_G10,
//     SAVE_G11,
//     SAVE_G12,
//     SAVE_G13,
//     SAVE_G14,
//     SAVE_G15,
//     COPY,
//     INC,
//     DEC,
//     BITAND,
//     BITOR,
//     BITXOR,
//     BITLSHIFT,
//     BITRSHIFT,
//     BITNOT,
//     EQ,
//     GT,
//     LT,
//     JMP,
//     JNZ,
//     JZ,
//     JMPI,
//     JNZI,
//     JZI,
//     ADDF,
//     SUBF,
//     MULTF,
//     DIVF,
//     FLOORF,
//     CEILF,
//     ROUNDF,
//     FLAG_ACK,
//     ADDV,
//     SUBV,
//     MULTV,
//     DIVV,
//     MODV,
//     EQV,
//     GTV,
//     LTV,
//     ABSV,
//     NEGV,
//     VEC,
//     VEC_NEG,
//     MAG,
//     LOAD_D,
//     LOAD_B,
//     LOAD_X,
//     NO_OP,
//     ISCAN,
//     OSCAN,
//     IOSTAT,
//     IOMAN,
//     IOREAD_B,
//     IOREAD_D,
//     IOREAD_X,
//     IOREAD_Q,
//     IOWRITE_B,
//     IOWRITE_D,
//     IOWRITE_X,
//     IOWRITE_Q,
//     IOFLUSH,
//     PERF_INFO,
//     MODEL_INFO,
//     SERIAL_NUMBER,
//     CYCLE_COUNT,
//     MEMSIZE,
//     END