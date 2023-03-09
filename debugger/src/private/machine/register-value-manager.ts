import { ByteSequence, ByteSequenceCreator, QuadByte, Register, VariableRegisterReference } from '@allium/types';
import { DebugSession } from '../debug/index';

export class RegisterValueManager {
    public valuesChanged(values: Array<VariableRegisterReference>): void {
      if (values.length > 0) {
        const session = this._getSession();
        if (!!session) {
          values.forEach(v => {
            this._map.set(v.register, session.machineData.getRegisterValue(v.register) as ByteSequence<4>);
          })
          this._pushValueMap(this._map);
        }
      }
    }
  
    public constructor(getSession: () => DebugSession | null, pushValueMap: (map: Map<Register, QuadByte>) => void) {
      this._map = RegisterValueManager.DEFAULT_MAP;
      this._getSession = getSession;
      this._pushValueMap = pushValueMap;
    }
  
    public static get DEFAULT_MAP(): Map<Register, QuadByte> {
      const map = new Map<Register, QuadByte>();
      map.set(Register.InstructionPtr, ByteSequenceCreator.QuadByte(0));
      map.set(Register.Accumulator, ByteSequenceCreator.QuadByte(0));
      map.set(Register.Monday, ByteSequenceCreator.QuadByte(0));
      map.set(Register.Tuesday, ByteSequenceCreator.QuadByte(0));
      map.set(Register.Wednesday, ByteSequenceCreator.QuadByte(0));
      map.set(Register.Thursday, ByteSequenceCreator.QuadByte(0));
      map.set(Register.Friday, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G7, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G8, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G9, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G10, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G11, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G12, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G13, ByteSequenceCreator.QuadByte(0));
      map.set(Register.G14, ByteSequenceCreator.QuadByte(0));
      map.set(Register.StackPtr, ByteSequenceCreator.QuadByte(0));
      return map;
    }
  
    private readonly _map: Map<Register, QuadByte>;
    private readonly _getSession: () => DebugSession | null;
    private readonly _pushValueMap: (map: Map<Register, QuadByte>) => void;
  }