/**
 * Creates an ADMIN account if one does not already exist.
 * Run once against the target DB:  npx ts-node prisma/seed-admin.ts
 * ADMIN cannot be self-assigned via /auth/register (REGISTERABLE_ROLES excludes it).
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@farmlink.test'
const ADMIN_PASSWORD = 'password123'

async function main(): Promise<void> {
  const existing = await prisma.profile.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.profile.update({ where: { id: existing.id }, data: { role: 'ADMIN' } })
      console.log(`Promoted ${ADMIN_EMAIL} to ADMIN.`)
    } else {
      console.log(`Admin ${ADMIN_EMAIL} already exists.`)
    }
    return
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.profile.create({
    data: {
      email: ADMIN_EMAIL,
      password,
      fullName: 'FarmLink Admin',
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
    },
  })
  console.log(`Created admin ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
