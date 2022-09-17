import { hashSync } from 'bcrypt';

const users = [
  {
    "name": "admin user",
    "email": "admin@gmail.com",
    "password": hashSync('password123', 8),
    "role": "admin",
  }, {
    "name": "Stone Sink",
    "email": "stonesink@gmail.com",
    "password": hashSync('password123', 8),
    "role": "salesagent",
  }, {
    "name": "Shaw craw",
    "email": "shawcraw1234@gmail.com",
    "password": hashSync('password123', 8),
    "role": "customer",
  }, {
    "name": "rando random",
    "email": "randorandom@gmail.com",
    "password": hashSync('password123', 8),
    "role": "customer",
  }, {
    "name": "RANDO",
    "email": "rando23@gmail.com",
    "password": hashSync('rando123', 8),
    "role": "customer",
  }, {
    "name": "Ross Lynch",
    "email": "rando232345@gmail.com",
    "password": hashSync('passesword', 8),
    "role": "customer",
  }
]

export default users
