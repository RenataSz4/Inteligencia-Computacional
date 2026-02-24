const API_URL = 'http://localhost:3002/prediction'

const modal = document.getElementById('modal')
const addBtn = document.getElementById('addBtn')
const cancelBtn = document.getElementById('cancelBtn')
const addForm = document.getElementById('addForm')
const vehiclesBody = document.getElementById('vehiclesBody')
const searchInput = document.getElementById('search')

addBtn.addEventListener('click', ()=> modal.classList.remove('hidden'))
cancelBtn.addEventListener('click', ()=> modal.classList.add('hidden'))

addForm.addEventListener('submit', async (e)=>{
  e.preventDefault()
  const fd = new FormData(addForm)

  const vehicleName = (fd.get('vehicle') || '').toString().trim()
  const ownerName = (fd.get('owner') || '').toString().trim()
  if (!vehicleName) { alert('Vehicle name is required'); return }
  if (!ownerName) { alert('Owner name is required'); return }

  const Engine_rpm = Number(fd.get('Engine_rpm'))
  const Lub_oil_pressure = Number(fd.get('Lub_oil_pressure'))
  const Fuel_pressure = Number(fd.get('Fuel_pressure'))
  const Coolant_pressure = Number(fd.get('Coolant_pressure'))
  const lub_oil_temp = Number(fd.get('lub_oil_temp'))
  const Coolant_temp = Number(fd.get('Coolant_temp'))

  const nums = [Engine_rpm, Lub_oil_pressure, Fuel_pressure, Coolant_pressure, lub_oil_temp, Coolant_temp]
  if (!nums.every(Number.isFinite)) { alert('All numeric fields must be valid numbers'); return }

  if (Engine_rpm < 0 || Engine_rpm > 20000) { alert('Engine RPM must be between 0 and 20000'); return }
  if (Lub_oil_pressure < 0 || Lub_oil_pressure > 100) { alert('Lubrication oil pressure out of expected range'); return }
  if (Fuel_pressure < 0 || Fuel_pressure > 100) { alert('Fuel pressure out of expected range'); return }
  if (Coolant_pressure < 0 || Coolant_pressure > 100) { alert('Coolant pressure out of expected range'); return }
  if (lub_oil_temp < -50 || lub_oil_temp > 500) { alert('Lubrication oil temperature out of expected range'); return }
  if (Coolant_temp < -50 || Coolant_temp > 500) { alert('Coolant temperature out of expected range'); return }

  const featuresPayload = {
    Engine_rpm,
    Lub_oil_pressure,
    Fuel_pressure,
    Coolant_pressure,
    lub_oil_temp,
    Coolant_temp
  }

  try{
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(featuresPayload)
    })
    if (!res.ok) {
      const text = await res.text().catch(()=>null)
      throw new Error(text || res.statusText)
    }
    const data = await res.json()

    let predNum = typeof data.prediction === 'number' ? Number(data.prediction) : NaN
    let confVal = null
    if (Array.isArray(data.probabilities)) {
      const probs = data.probabilities
      const maxIndex = probs.indexOf(Math.max(...probs))
      predNum = maxIndex
      confVal = probs[maxIndex]
    } else {
      const rawProb = data.probability ?? data.confidence
      confVal = Array.isArray(rawProb) ? rawProb[1] : rawProb
    }

    appendRow({
      vehicle: vehicleName,
      owner: ownerName,
      ...featuresPayload,
      prediction: predNum,
      confidence: (confVal !== undefined && confVal !== null) ? Number(confVal).toFixed(3) : ''
    })
  }catch(err){
    alert('Prediction failed: '+(err.message||err))
  }finally{
    modal.classList.add('hidden')
    addForm.reset()
  }
})

function appendRow(item){
  const predNum = Number(item.prediction)
  let predText = ''
  let badgeClass = 'ok'
  if (!Number.isFinite(predNum)) {
    predText = 'Unknown'
    badgeClass = 'danger'
  } else if (predNum === 1) {
    predText = 'Maintenance required'
    badgeClass = 'warn'
  } else {
    predText = 'No maintenance required'
    badgeClass = 'ok'
  }
  const conf = item.confidence !== undefined && item.confidence !== '' ? Number(item.confidence) : ''
  const tr = document.createElement('tr')
  tr.innerHTML = `
    <td>${escapeHtml(item.vehicle)}</td>
    <td>${escapeHtml(item.owner)}</td>
    <td>${item.Engine_rpm}</td>
    <td>${item.Lub_oil_pressure}</td>
    <td>${item.Fuel_pressure}</td>
    <td>${item.Coolant_pressure}</td>
    <td>${item.lub_oil_temp}</td>
    <td>${item.Coolant_temp}</td>
    <td><span class="badge ${badgeClass}">${predText}</span></td>
    <td>${conf === '' ? '' : (conf < 1 ? (conf*100).toFixed(1) + '%' : Number(conf).toFixed(3))}</td>
  `
  vehiclesBody.prepend(tr)
}

searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.toLowerCase()
  Array.from(vehiclesBody.children).forEach(tr=>{
    const name = tr.children[0].textContent.toLowerCase()
    tr.style.display = name.includes(q) ? '' : 'none'
  })
})

function escapeHtml(s){
  if(!s) return ''
  return s.replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  }[c]))
}
