import pino from "pino";
import pretty from "pino-pretty";
import moment from "moment";

// export const logger = pino(
//     pino.destination({
//       dest: "./logs/server.log",
//       minLength: 4096, // Buffer before writing
//       sync: false, // Asynchronous logging
//     }),
//     {
//       transport: {
//         target: "pino-pretty",
//         options: {
//           prettyPrint: {
//             translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
//             ignore: "pid,hostname",
//             colorize: true,
//           },
//         },
//       },
//     }
//   );

const transport = pino.transport({
    targets: [{
      level: 'trace',
      target: 'pino-pretty',
      options: {
            prettyPrint: {
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname",
            colorize: true,
            },
            destination:  './logs/server.log',
        }, 
    },
    ]
  })

  export const logger = pino(transport)