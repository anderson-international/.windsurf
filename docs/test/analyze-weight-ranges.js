require('dotenv').config()

// Replicate the exact weight range generation logic
class WeightRangeCalculator {
  constructor(config) {
    this.config = config
  }

  generateBaseWeightRanges() {
    const ranges = []
    
    // First loop: 0.05 to 0.50 in 0.05 increments
    for (let weight = 0.05; weight <= 0.50; weight += 0.05) {
      ranges.push({
        min: Math.round((weight - 0.05) * 100) / 100,
        max: Math.round(weight * 100) / 100
      })
    }
    
    // Second loop: 0.60 to 2.00 in 0.10 increments  
    for (let weight = 0.60; weight <= 2.00; weight += 0.10) {
      ranges.push({
        min: Math.round((weight - 0.10) * 100) / 100,
        max: Math.round(weight * 100) / 100
      })
    }
    
    return ranges
  }

  generateParcelRanges(parcelNumber) {
    const baseRanges = this.generateBaseWeightRanges()
    const ranges = []
    
    const previousParcelMax = (parcelNumber - 1) * this.config.MAX_PARCEL_WEIGHT
    
    baseRanges.forEach(range => {
      const adjustedMin = previousParcelMax + range.min
      const adjustedMax = previousParcelMax + range.max
      if (adjustedMax <= this.config.MAX_TOTAL_WEIGHT) {
        ranges.push({
          min: Math.round(adjustedMin * 100) / 100,
          max: Math.round(adjustedMax * 100) / 100
        })
      }
    })
    
    return ranges
  }
}

async function analyzeWeightRanges() {
  console.log('🔬 Detailed Weight Range Analysis')
  console.log('=================================\n')

  // Replicate exact config from rate-generator.ts
  const config = {
    MAX_PARCEL_WEIGHT: 2.00,
    MAX_TOTAL_WEIGHT: 8.00,
    MAX_PARCELS: 4
  }

  const calculator = new WeightRangeCalculator(config)

  console.log('📋 Base Weight Ranges:')
  console.log('======================')
  const baseRanges = calculator.generateBaseWeightRanges()
  baseRanges.forEach((range, i) => {
    console.log(`   ${i+1}. ${range.min}kg → ${range.max}kg`)
  })

  console.log(`\n📦 Generated Ranges by Parcel:`)
  console.log('==============================')

  for (let parcel = 1; parcel <= 4; parcel++) {
    console.log(`\n🎁 Parcel ${parcel}:`)
    const parcelRanges = calculator.generateParcelRanges(parcel)
    
    if (parcelRanges.length === 0) {
      console.log('   No ranges (exceeds MAX_TOTAL_WEIGHT)')
      continue
    }

    // Show ranges around the 2kg boundary
    const relevantRanges = parcelRanges.filter(r => 
      (r.min >= 1.7 && r.min <= 2.3) || 
      (r.max >= 1.7 && r.max <= 2.3)
    )

    if (relevantRanges.length > 0) {
      console.log('   Ranges around 2kg boundary:')
      relevantRanges.forEach(range => {
        console.log(`     ${range.min}kg → ${range.max}kg`)
      })
    } else {
      console.log(`   First few ranges:`)
      parcelRanges.slice(0, 5).forEach(range => {
        console.log(`     ${range.min}kg → ${range.max}kg`)
      })
    }
  }

  console.log('\n🔍 Critical Gap Analysis:')
  console.log('=========================')
  
  // Collect ALL ranges from all parcels
  const allRanges = []
  for (let parcel = 1; parcel <= 4; parcel++) {
    const parcelRanges = calculator.generateParcelRanges(parcel)
    parcelRanges.forEach(range => {
      allRanges.push({
        ...range,
        parcel: parcel
      })
    })
  }

  // Sort by min weight
  allRanges.sort((a, b) => a.min - b.min)

  // Find ranges around 1.9-2.0kg boundary
  console.log('\nRanges around 1.9-2.0kg boundary:')
  const boundaryRanges = allRanges.filter(r => 
    r.min <= 2.0 && r.max >= 1.9
  )

  boundaryRanges.forEach(range => {
    console.log(`   Parcel ${range.parcel}: ${range.min}kg → ${range.max}kg`)
  })

  // Check for the specific gap
  const covers195 = allRanges.filter(r => r.min <= 1.95 && r.max > 1.95)
  
  console.log('\n🎯 Coverage test for 1.95kg:')
  if (covers195.length === 0) {
    console.log('   ❌ NO RANGE covers 1.95kg')
    
    // Find the gap
    const beforeGap = allRanges.filter(r => r.max <= 1.95).slice(-1)[0]
    const afterGap = allRanges.filter(r => r.min >= 1.95)[0]
    
    if (beforeGap && afterGap) {
      console.log(`   Gap identified:`)
      console.log(`     Last range before: ${beforeGap.min}kg → ${beforeGap.max}kg (Parcel ${beforeGap.parcel})`)
      console.log(`     Next range after: ${afterGap.min}kg → ${afterGap.max}kg (Parcel ${afterGap.parcel})`)
      console.log(`     Missing coverage: ${beforeGap.max}kg → ${afterGap.min}kg`)
    }
  } else {
    console.log(`   ✅ Covered by: ${covers195[0].min}kg → ${covers195[0].max}kg (Parcel ${covers195[0].parcel})`)
  }

  console.log('\n📊 Range Transition Analysis:')
  console.log('=============================')
  
  // Look for transitions between parcels
  for (let parcel = 1; parcel < 4; parcel++) {
    const currentParcelRanges = allRanges.filter(r => r.parcel === parcel)
    const nextParcelRanges = allRanges.filter(r => r.parcel === (parcel + 1))
    
    if (currentParcelRanges.length > 0 && nextParcelRanges.length > 0) {
      const lastCurrent = currentParcelRanges[currentParcelRanges.length - 1]
      const firstNext = nextParcelRanges[0]
      
      console.log(`\nParcel ${parcel} → Parcel ${parcel + 1} transition:`)
      console.log(`   Last P${parcel} range: ${lastCurrent.min}kg → ${lastCurrent.max}kg`)
      console.log(`   First P${parcel + 1} range: ${firstNext.min}kg → ${firstNext.max}kg`)
      
      if (Math.abs(lastCurrent.max - firstNext.min) > 0.001) {
        console.log(`   ❌ GAP: ${lastCurrent.max}kg → ${firstNext.min}kg`)
      } else {
        console.log(`   ✅ Seamless transition`)
      }
    }
  }
}

if (require.main === module) {
  analyzeWeightRanges()
}

module.exports = { analyzeWeightRanges }
