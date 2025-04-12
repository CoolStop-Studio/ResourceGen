let json;
let inventory = {}
let conversionsIn = {}
let conversionsOut = {}

fetch('./data.json')
  .then(response => response.json())
  .then(data => {
    json = data;
    loadModules();
    loadValues();
  });

function loadValues() {
  const defaultValue = 100;
  const materialList = json.materials;

  const materialObject = Object.fromEntries(
    materialList.map(material => [material, defaultValue])
  );

  inventory = { ...materialObject };
  conversionsIn = { ...materialObject };
  conversionsOut = { ...materialObject };
}


function loadModules() {
  json.modules.forEach(e => {
    const newDiv = document.createElement("div");

    newDiv.classList.add("module");

    const buyButton = document.createElement("button");
    const inputArea = document.createElement("div");
    const outputArea = document.createElement("div");
    const costArea = document.createElement("div");

    buyButton.innerHTML = 'buy';
    buyButton.addEventListener('click', () => {
      alert("BUYING");

      for (const costItem of e.cost) {
        if (inventory[costItem.type] < costItem.amount) {
          alert("NOT ENOUGH");
          return;
        }
      }

      e.cost.forEach(costItem => {
        inventory[costItem.type] -= costItem.amount;
      });

      e.in.forEach(inItem => {
        conversionsIn[inItem.type] += inItem.amount;
      });

      e.out.forEach(outItem => {
        conversionsOut[outItem.type] += outItem.amount;
      });

      alert("SUCCESS BUY");
    });


    inputArea.innerHTML = `In: ${formatResourcesArray(e.in)}`
    outputArea.innerHTML = `Out: ${formatResourcesArray(e.out)}`
    costArea.innerHTML = `Cost: ${formatResourcesArray(e.cost)}`

    newDiv.innerHTML = `
      <h1>${e.name}</h1>
    `;

    newDiv.appendChild(buyButton);
    newDiv.appendChild(inputArea);
    newDiv.appendChild(outputArea);
    newDiv.appendChild(costArea)
    document.getElementById('modules').appendChild(newDiv);
  });
}

// In: [ {"type": "strength", "amount": 1}, {"type": "wood", "amount": 4} ]
// Out: "💪1, 🪵4"
function formatResourcesArray(resources) {
  return resources
    .map(item => `${json.emoji[item.type] || ''}${item.amount}`)
    .join(', ');
}

function formatResourcesObject(resources) {
  return Object.entries(resources)
    .map(([type, amount]) => `${json.emoji[type] || ''}${amount}`)
    .join(', ');
}


function updateDisplays() {
  document.getElementById("inventory").innerHTML = formatResourcesObject(inventory);
}

function updateValues() {
  for (const key in inventory) {
    if (inventory.hasOwnProperty(key)) {
      inventory[key] -= (conversionsIn[key] || 0) - (conversionsOut[key] || 0);
    }
  }
}

setInterval(updateDisplays, 1000);
setInterval(updateValues, 1000);