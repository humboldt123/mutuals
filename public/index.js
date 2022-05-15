window.addEventListener("load", () => graph());
async function graph() {
  let container = document.getElementById("network");
  let connections = await (await fetch("./connections")).json();
  let options = await (await fetch("./options.json")).json();

  let data = {nodes: [], edges: []};

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
      // Register the link
      let links = []
      friend.connections.forEach(mutual => data.edges.push({from: parseInt(id), to: parseInt(mutual)}));
    }
  }

  network = new vis.Network(container, data, options);
}
