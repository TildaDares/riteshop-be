import { Schema } from "mongoose";

interface Token extends Object {
  id: Schema.Types.ObjectId;
  exp: number;
}

export default Token;
