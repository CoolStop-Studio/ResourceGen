let json;
let inventory = {}
let conversions = [
  0, 0, 0, 0, 0, 0
]

fetch('./data.json')
  .then(response => response.json())
  .then(data => {
    json = data;
    loadModules();
    loadInventory();
  });

function loadInventory() {
  const defaultValue = 100;
  const materialList = json.materials;

  const materialObject = Object.fromEntries(
    materialList.map(material => [material, defaultValue])
  );

  inventory = { ...materialObject };
}


function loadModules() {
  json.modules.forEach(e => {
    const newDiv = document.createElement("div");

    newDiv.classList.add("module");

    const buyButton = document.createElement("button");
    const inputArea = document.createElement("div");
    const outputArea = document.createElement("div");
    const costArea = document.createElement("div");

    buyButton.innerHTML = 'buy x0';
    buyButton.addEventListener('click', () => {
      for (const costItem of e.cost) {
        if (inventory[costItem.type] < costItem.amount) {
          return;
        }
      }

      e.cost.forEach(costItem => {
        inventory[costItem.type] -= costItem.amount;
      });

      conversions[json.modules.findIndex(m => m.name === e.name)]++
      buyButton.innerHTML = 'buy x' + conversions[json.modules.findIndex(m => m.name === e.name)]
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
  for (let module = 0; module < conversions.length; module++) {
    for (let useModule = 0; useModule < conversions[module]; useModule++) {

      // Check if we can afford all inputs
      let canAfford = true;
      for (const inputNum of json.modules[module].in) {
        if (inventory[inputNum.type] < inputNum.amount) {
          canAfford = false;
          break;
        }
      }

      if (!canAfford) continue; // Skip this iteration if we can't afford

      // Deduct inputs
      json.modules[module].in.forEach(input => {
        inventory[input.type] -= input.amount;
      });

      // Add outputs
      json.modules[module].out.forEach(output => {
        inventory[output.type] += output.amount;
      });
    }
  }
}

setInterval(updateDisplays, 1000);
setInterval(updateValues, 1000);