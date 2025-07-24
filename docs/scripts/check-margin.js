const { PrismaClient } = require('@prisma/client')

async function checkMargin() {
  const prisma = new PrismaClient()
  
  try {
    const rates = await prisma.generated_rates.findMany({
      take: 5,
      select: {
        zone_name: true,
        weight_min: true,
        weight_max: true,
        tariff: true,
        calculated_price: true
      }
    })

    console.log('Sample rates with margin calculation:')
    rates.forEach(rate => {
      const tariff = Number(rate.tariff)
      const finalPrice = Number(rate.calculated_price)
      const marginApplied = ((finalPrice - tariff) / tariff * 100).toFixed(2)
      
      console.log(`Zone: ${rate.zone_name}`)
      console.log(`Weight: ${rate.weight_min}kg - ${rate.weight_max}kg`)
      console.log(`Tariff: £${tariff}`)
      console.log(`Final Price: £${finalPrice}`)
      console.log(`Margin Applied: ${marginApplied}%`)
      console.log('---')
    })

    const carrier = await prisma.carriers.findFirst({
      where: { active: true },
      select: { margin_percentage: true }
    })

    console.log(`Carrier margin setting: ${carrier.margin_percentage}%`)
    
  } finally {
    await prisma.$disconnect()
  }
}

checkMargin()
