import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // 1. Create Admin User using Better Auth Account convention (provider="credential")
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gambetaygol.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'supersecret123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      emailVerified: true,
      accounts: {
        create: {
          accountId: adminEmail,
          providerId: 'credential',
          password: passwordHash
        }
      }
    }
  })

  console.log(`Admin user created: ${user.email}`)

  // 2. Create Países: Argentina, España
  const ar = await prisma.pais.upsert({
    where: { codigo: 'AR' },
    update: {},
    create: { nombre: 'Argentina', codigo: 'AR' }
  })
  
  const es = await prisma.pais.upsert({
    where: { codigo: 'ES' },
    update: {},
    create: { nombre: 'España', codigo: 'ES' }
  })

  // 3. Create Ligas
  const ligaAr = await prisma.liga.upsert({
    where: { slug: 'liga-profesional' },
    update: {},
    create: { nombre: 'Liga Profesional', slug: 'liga-profesional', paisId: ar.id }
  })

  const laLiga = await prisma.liga.upsert({
    where: { slug: 'la-liga' },
    update: {},
    create: { nombre: 'La Liga', slug: 'la-liga', paisId: es.id }
  })

  // 4. Create Clubes
  const boca = await prisma.club.upsert({
    where: { slug: 'boca-juniors' },
    update: {},
    create: { nombre: 'Boca Juniors', slug: 'boca-juniors', paisId: ar.id, ligaId: ligaAr.id }
  })

  const river = await prisma.club.upsert({
    where: { slug: 'river-plate' },
    update: {},
    create: { nombre: 'River Plate', slug: 'river-plate', paisId: ar.id, ligaId: ligaAr.id }
  })

  const madrid = await prisma.club.upsert({
    where: { slug: 'real-madrid' },
    update: {},
    create: { nombre: 'Real Madrid', slug: 'real-madrid', paisId: es.id, ligaId: laLiga.id }
  })

  const barca = await prisma.club.upsert({
    where: { slug: 'barcelona' },
    update: {},
    create: { nombre: 'Barcelona', slug: 'barcelona', paisId: es.id, ligaId: laLiga.id }
  })

  // 5. Create Products
  console.log('Creating products...')
  const prod1 = await prisma.product.upsert({
    where: { slug: 'camiseta-boca-titular-2024' },
    update: {},
    create: {
      nombre: 'Camiseta Boca Juniors Titular 2024',
      slug: 'camiseta-boca-titular-2024',
      descripcion: 'La nueva piel del Xeneize.',
      categoria: 'Fan',
      precio: 85000,
      clubId: boca.id,
      destacado: true,
      variants: {
        create: [
          { talla: 'M', stock: 10, sku: 'BOC-TIT-24-M' },
          { talla: 'L', stock: 5, sku: 'BOC-TIT-24-L' }
        ]
      },
      images: {
        create: [
          { url: 'https://placehold.co/600x600/0a0a0a/ffdd00?text=Boca+Titular', esPrincipal: true, orden: 0 }
        ]
      }
    }
  })

  const prod2 = await prisma.product.upsert({
    where: { slug: 'camiseta-madrid-titular-2024' },
    update: {},
    create: {
      nombre: 'Camiseta Real Madrid Titular 2024',
      slug: 'camiseta-madrid-titular-2024',
      descripcion: 'El rey de Europa.',
      categoria: 'Jugador',
      precio: 120000,
      clubId: madrid.id,
      variants: {
        create: [
          { talla: 'L', stock: 2, sku: 'RMA-TIT-24-L' }
        ]
      },
      images: {
        create: [
          { url: 'https://placehold.co/600x600/ffffff/0a0a0a?text=Madrid+Titular', esPrincipal: true, orden: 0 }
        ]
      }
    }
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
