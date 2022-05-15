window.addEventListener("load", () => graph());
async function graph() {
  let container = document.getElementById("network");
  let connections = await (await fetch("./connections")).json();
  let options = await (await fetch("./options.json")).json();

  let data = {nodes: [], edges: []};
  let links = new Set();

  // Loop through connections...
  for (id in connections) {
    friend = connections[id];
    if (friend.connections.length >= 0) {
      // Add to nodes
      data.nodes.push({
        id: parseInt(id),
        image: friend.avatarUrl,
        label: friend.username,
      });
      // Add the links to our set
      friend.connections.forEach(mutual => links.add([id, mutual].sort((a, b) => parseInt(a) - parseInt(b)).join(" ")));
    }
  }

  // Register each link in edges
  [...links].forEach(link => data.edges.push({from:parseInt(link.split(" ")[0]), to:parseInt(link.split(" ")[1])}));

  network = new vis.Network(container, data, options);
}
