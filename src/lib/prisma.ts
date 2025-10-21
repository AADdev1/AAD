import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['warn', 'error'], // only warnings and errors in prod
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'], // keep dev output clean too
    })
  }
  prisma = global.prisma
}

// remove the manual query listener
// prisma.$on('query', (e) => {
//   console.log('Query:', e.query)
//   console.log('Params:', e.params)
// })

export default prisma
