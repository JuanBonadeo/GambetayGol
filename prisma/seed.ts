import { PrismaClient } from '@prisma/client'
import { auth } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gambetaygol.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'supersecretpassword123!'

  await prisma.user.deleteMany({ where: { email: adminEmail } })
  await auth.api.signUpEmail({
    body: { name: 'Admin', email: adminEmail, password: adminPassword },
    headers: new Headers()
  })
  console.log(`Admin user created: ${adminEmail}`)

  // ─── Países ────────────────────────────────────────────────────────────────
  const paisesData = [
    { nombre: 'Argentina',      codigo: 'AR' },
    { nombre: 'Brasil',         codigo: 'BR' },
    { nombre: 'España',         codigo: 'ES' },
    { nombre: 'Alemania',       codigo: 'DE' },
    { nombre: 'Italia',         codigo: 'IT' },
    { nombre: 'Francia',        codigo: 'FR' },
    { nombre: 'Inglaterra',     codigo: 'EN' },
    { nombre: 'Portugal',       codigo: 'PT' },
    { nombre: 'Países Bajos',   codigo: 'NL' },
    { nombre: 'Uruguay',        codigo: 'UY' },
    { nombre: 'México',         codigo: 'MX' },
    { nombre: 'Colombia',       codigo: 'CO' },
    { nombre: 'Bélgica',        codigo: 'BE' },
    { nombre: 'Turquía',        codigo: 'TR' },
    { nombre: 'Japón',          codigo: 'JP' },
    { nombre: 'Internacional',  codigo: 'INT' }, // para la liga de selecciones
  ]

  const paises: Record<string, { id: string }> = {}
  for (const p of paisesData) {
    paises[p.codigo] = await prisma.pais.upsert({
      where: { codigo: p.codigo },
      update: { nombre: p.nombre },
      create: p,
    })
  }
  console.log(`Países: ${Object.keys(paises).length} creados/actualizados`)

  // ─── Ligas ─────────────────────────────────────────────────────────────────
  const ligasData = [
    { nombre: 'Premier League',    slug: 'premier-league',    codigo: 'EN' },
    { nombre: 'La Liga',           slug: 'la-liga',           codigo: 'ES' },
    { nombre: 'Bundesliga',        slug: 'bundesliga',        codigo: 'DE' },
    { nombre: 'Serie A',           slug: 'serie-a',           codigo: 'IT' },
    { nombre: 'Ligue 1',           slug: 'ligue-1',           codigo: 'FR' },
    { nombre: 'Liga Profesional',  slug: 'liga-profesional',  codigo: 'AR' },
    { nombre: 'Brasileirão',       slug: 'brasileirao',       codigo: 'BR' },
    { nombre: 'Selecciones',       slug: 'selecciones',       codigo: 'INT' },
  ]

  const ligas: Record<string, { id: string }> = {}
  for (const l of ligasData) {
    ligas[l.slug] = await prisma.liga.upsert({
      where: { slug: l.slug },
      update: { nombre: l.nombre },
      create: { nombre: l.nombre, slug: l.slug, paisId: paises[l.codigo].id },
    })
  }
  console.log(`Ligas: ${Object.keys(ligas).length} creadas/actualizadas`)

  // ─── Clubes ────────────────────────────────────────────────────────────────
  // [ nombre, slug, paisCodigo, ligaSlug ]
  const clubesData: [string, string, string, string][] = [
    // Premier League (7)
    ['Manchester City',    'man-city',             'EN', 'premier-league'],
    ['Manchester United',  'man-united',           'EN', 'premier-league'],
    ['Liverpool',          'liverpool',            'EN', 'premier-league'],
    ['Arsenal',            'arsenal',              'EN', 'premier-league'],
    ['Chelsea',            'chelsea',              'EN', 'premier-league'],
    ['Tottenham Hotspur',  'tottenham',            'EN', 'premier-league'],
    ['Newcastle United',   'newcastle',            'EN', 'premier-league'],

    // La Liga (7)
    ['Real Madrid',        'real-madrid',          'ES', 'la-liga'],
    ['Barcelona',          'barcelona',            'ES', 'la-liga'],
    ['Atlético de Madrid', 'atletico-madrid',      'ES', 'la-liga'],
    ['Sevilla',            'sevilla',              'ES', 'la-liga'],
    ['Valencia',           'valencia',             'ES', 'la-liga'],
    ['Athletic Club',      'athletic-club',        'ES', 'la-liga'],
    ['Villarreal',         'villarreal',           'ES', 'la-liga'],

    // Bundesliga (5)
    ['Bayern München',           'bayern-munich',         'DE', 'bundesliga'],
    ['Borussia Dortmund',        'borussia-dortmund',     'DE', 'bundesliga'],
    ['RB Leipzig',               'rb-leipzig',            'DE', 'bundesliga'],
    ['Bayer Leverkusen',         'bayer-leverkusen',      'DE', 'bundesliga'],
    ['Borussia Mönchengladbach', 'borussia-monchengladbach', 'DE', 'bundesliga'],

    // Serie A (6)
    ['Juventus',    'juventus',    'IT', 'serie-a'],
    ['AC Milan',    'ac-milan',    'IT', 'serie-a'],
    ['Inter Milan', 'inter-milan', 'IT', 'serie-a'],
    ['Napoli',      'napoli',      'IT', 'serie-a'],
    ['Roma',        'roma',        'IT', 'serie-a'],
    ['Lazio',       'lazio',       'IT', 'serie-a'],

    // Ligue 1 (5)
    ['Paris Saint-Germain',   'paris-saint-germain',  'FR', 'ligue-1'],
    ['Olympique de Marseille','olympique-marseille',   'FR', 'ligue-1'],
    ['Olympique Lyonnais',    'olympique-lyon',        'FR', 'ligue-1'],
    ['Monaco',                'monaco',                'FR', 'ligue-1'],
    ['Lille',                 'lille',                 'FR', 'ligue-1'],

    // Liga Profesional (6)
    ['Boca Juniors',  'boca-juniors',  'AR', 'liga-profesional'],
    ['River Plate',   'river-plate',   'AR', 'liga-profesional'],
    ['Racing Club',   'racing-club',   'AR', 'liga-profesional'],
    ['Independiente', 'independiente', 'AR', 'liga-profesional'],
    ['San Lorenzo',   'san-lorenzo',   'AR', 'liga-profesional'],
    ['Estudiantes',   'estudiantes',   'AR', 'liga-profesional'],

    // Brasileirão (6)
    ['Flamengo',        'flamengo',         'BR', 'brasileirao'],
    ['Palmeiras',       'palmeiras',        'BR', 'brasileirao'],
    ['Corinthians',     'corinthians',      'BR', 'brasileirao'],
    ['Santos',          'santos',           'BR', 'brasileirao'],
    ['São Paulo FC',    'sao-paulo-fc',     'BR', 'brasileirao'],
    ['Fluminense',      'fluminense',       'BR', 'brasileirao'],

    // Selecciones (8)
    ['Selección Argentina', 'seleccion-argentina', 'AR', 'selecciones'],
    ['Selección Brasil',    'seleccion-brasil',    'BR', 'selecciones'],
    ['Selección Francia',   'seleccion-francia',   'FR', 'selecciones'],
    ['Selección España',    'seleccion-espana',    'ES', 'selecciones'],
    ['Selección Alemania',  'seleccion-alemania',  'DE', 'selecciones'],
    ['Selección Portugal',  'seleccion-portugal',  'PT', 'selecciones'],
    ['Selección Inglaterra','seleccion-inglaterra', 'EN', 'selecciones'],
    ['Selección Italia',    'seleccion-italia',    'IT', 'selecciones'],
  ]

  const clubes: Record<string, { id: string }> = {}
  for (const [nombre, slug, paisCodigo, ligaSlug] of clubesData) {
    clubes[slug] = await prisma.club.upsert({
      where: { slug },
      update: { nombre },
      create: {
        nombre,
        slug,
        paisId: paises[paisCodigo].id,
        ligaId: ligas[ligaSlug].id,
      },
    })
  }
  console.log(`Clubes: ${Object.keys(clubes).length} creados/actualizados`)

  // ─── Productos de ejemplo ──────────────────────────────────────────────────
  const productosEjemplo = [
    {
      nombre: 'Camiseta Boca Juniors Titular 2024',
      slug: 'camiseta-boca-titular-2024',
      descripcion: 'La nueva piel del Xeneize.',
      categoria: 'Fan' as const,
      precio: 85000,
      clubSlug: 'boca-juniors',
      destacado: true,
      variants: [
        { talla: 'M' as const, stock: 10, sku: 'BOC-TIT-24-M' },
        { talla: 'L' as const, stock: 5,  sku: 'BOC-TIT-24-L' },
      ],
      imageUrl: '',
    },
    {
      nombre: 'Camiseta Real Madrid Titular 2024',
      slug: 'camiseta-madrid-titular-2024',
      descripcion: 'El rey de Europa.',
      categoria: 'Jugador' as const,
      precio: 120000,
      clubSlug: 'real-madrid',
      destacado: false,
      variants: [
        { talla: 'L' as const, stock: 2, sku: 'RMA-TIT-24-L' },
      ],
      imageUrl: '',
    },
    {
      nombre: 'Camiseta Liverpool Titular 2024',
      slug: 'camiseta-liverpool-titular-2024',
      descripcion: 'You\'ll Never Walk Alone.',
      categoria: 'Fan' as const,
      precio: 110000,
      clubSlug: 'liverpool',
      destacado: true,
      variants: [
        { talla: 'M' as const, stock: 8, sku: 'LIV-TIT-24-M' },
        { talla: 'L' as const, stock: 6, sku: 'LIV-TIT-24-L' },
      ],
      imageUrl: '',
    },
    {
      nombre: 'Camiseta Bayern München Titular 2024',
      slug: 'camiseta-bayern-titular-2024',
      descripcion: 'Mia san mia.',
      categoria: 'Jugador' as const,
      precio: 115000,
      clubSlug: 'bayern-munich',
      destacado: true,
      variants: [
        { talla: 'S' as const, stock: 3, sku: 'BAY-TIT-24-S' },
        { talla: 'M' as const, stock: 7, sku: 'BAY-TIT-24-M' },
      ],
      imageUrl: '',
    },
    {
      nombre: 'Camiseta Flamengo Titular 2024',
      slug: 'camiseta-flamengo-titular-2024',
      descripcion: 'Mengão para o mundo.',
      categoria: 'Fan' as const,
      precio: 75000,
      clubSlug: 'flamengo',
      destacado: true,
      variants: [
        { talla: 'M' as const, stock: 12, sku: 'FLA-TIT-24-M' },
        { talla: 'L' as const, stock: 8,  sku: 'FLA-TIT-24-L' },
      ],
      imageUrl: '',
    },
    {
      nombre: 'Camiseta Selección Argentina 2022 Retro',
      slug: 'camiseta-seleccion-argentina-2022-retro',
      descripcion: 'La campeona del mundo. Edición retro.',
      categoria: 'Retro' as const,
      precio: 95000,
      clubSlug: 'seleccion-argentina',
      destacado: true,
      variants: [
        { talla: 'M' as const,  stock: 15, sku: 'ARG-RET-22-M' },
        { talla: 'L' as const,  stock: 10, sku: 'ARG-RET-22-L' },
        { talla: 'XL' as const, stock: 5,  sku: 'ARG-RET-22-XL' },
      ],
      imageUrl: '',
    },
  ]

  for (const p of productosEjemplo) {
    const { variants, imageUrl, clubSlug, ...rest } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...rest,
        clubId: clubes[clubSlug].id,
        variants: { create: variants },
        images: {
          create: [{ url: imageUrl, esPrincipal: true, orden: 0 }],
        },
      },
    })
  }
  console.log(`Productos de ejemplo: ${productosEjemplo.length} creados`)

  console.log('\n✓ Seed completado exitosamente.')
  console.log(`  ${paisesData.length} países`)
  console.log(`  ${ligasData.length} ligas`)
  console.log(`  ${clubesData.length} clubes`)
  console.log(`  ${productosEjemplo.length} productos de ejemplo`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
