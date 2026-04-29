let spineData = null;

const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");

fileInput.addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt) {
    try {
      spineData = JSON.parse(evt.target.result);
      analyzeBoneDepths();
    } catch (err) {
      output.textContent = "Error reading JSON:\n" + err.message;
    }
  };

  reader.readAsText(file);
}

function analyzeBoneDepths() {
  if (!spineData.bones || !Array.isArray(spineData.bones)) {
    output.textContent = "No bones found in this Spine JSON.";
    return;
  }

  const boneMap = new Map();

  spineData.bones.forEach(bone => {
    boneMap.set(bone.name, {
      name: bone.name,
      parent: bone.parent || null
    });
  });

  const chains = [];

  boneMap.forEach(bone => {
    const chain = buildChain(bone.name, boneMap);

    chains.push({
      depth: chain.length,
      chain: chain
    });
  });

  chains.sort((a, b) => b.depth - a.depth);

  const rows = [];

  rows.push("Bone Depth Analysis");
  rows.push("===================");
  rows.push("");
  rows.push(`Total bones: ${spineData.bones.length}`);
  rows.push(`Deepest chain: ${chains[0].depth}`);
  rows.push("");
  rows.push("Depth | Bone Chain");
  rows.push("------------------");

  chains.forEach(item => {
    rows.push(`${item.depth}: ${item.chain.join(" -> ")}`);
  });

  output.textContent = rows.join("\n");
}

function buildChain(boneName, boneMap) {
  const chain = [];
  const visited = new Set();

  let current = boneMap.get(boneName);

  while (current) {
    if (visited.has(current.name)) {
      chain.unshift("[cycle detected]");
      break;
    }

    visited.add(current.name);
    chain.unshift(current.name);

    if (!current.parent) break;

    current = boneMap.get(current.parent);

    if (!current) {
      chain.unshift("[missing parent]");
      break;
    }
  }

  return chain;
}
