# @tsed/mongoose

> Experimental feature. You can contribute to improve this feature !

A package of Ts.ED framework. See website: https://romakita.github.io/ts-express-decorators/#/tutorials/mongoose

Currently, `@tsed/mongoose` allows you to configure one or more MongoDB database connections via
the `@ServerSettings` configuration.

All databases will be initialized when the server starts during the server's `OnInit` phase.

## Installation

Before using the `@tsed/mongoose` package, we need to install the [mongoose](https://www.npmjs.com/package/mongoose) module.

```bash
npm install --save mongoose
npm install --save @tsed/mongoose
```

Then import `@tsed/mongoose` in your [ServerLoader](api/common/server/serverloader.md):

```typescript
import {ServerLoader, ServerSettings} from "@tsed/common";
import "@tsed/mongoose"; // import mongoose ts.ed module

@ServerSettings({
   mongoose: {
       url: "mongodb://127.0.0.1:27017/db1",
       connectionOptions: {
           
       }
   }
})
export class Server extends ServerLoader {

}
```

## Multi databases

The mongoose module of Ts.ED Mongoose allows to configure several basic connections to MongoDB.
Here is an example configuration:

```typescript
import {ServerLoader, ServerSettings} from "@tsed/common";
import "@tsed/mongoose"; // import mongoose ts.ed module

@ServerSettings({
    mongoose: {
       urls: {
           db1: {
               url: "mongodb://127.0.0.1:27017/db1",
               connectionOptions: {
                   
               }
           },
           db2: {
              url: "mongodb://127.0.0.1:27017/db2",
              connectionOptions: {
                  
              }
           }
       }
    }
})
export class Server extends ServerLoader {

}
```
