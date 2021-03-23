// dev
$(document).ready(function(){
  $("#start").on("click", function(){
    if ($("#chosen-algorithm>button").text()== "Dijkstra") {
      dijkstra_pfa()
    } else if ($("#chosen-algorithm>button").text()== "A-Star") {
      astar_pfa()
    } else if ($("#chosen-algorithm>button").text()== "Greedy Best First Search") {
      gbfs_pfa()
    }
  })
})

//

// global variables
var pageStartnode= $("mapTable>tbody>tr>td:eq(0)>button")
var pageEndnode= $("mapTable>tbody>tr>td:eq(1)>button")
var color_code= {lowCost: "#28CC2D", mediumCost: "#FFF44F", highCost: "#D82E3F", wallNode: "black"}
var color_code_se= {startNode: "#63CAD8", endNode: "#FE7C00"}
var sidebar_function
//

// global functions

function map_response(){
  $(".cell").on("mousedown", function(){
    $(this).css({"background-color": color_code[sidebar_function]})
    $(".cell").on("mouseover", function(){
      $(this).css({"background-color": color_code[sidebar_function]})
    })
  })
  $(".cell").on("mouseup", function(){
    $(this).css({"background-color": color_code[sidebar_function]})
    $(".cell").unbind("mouseover")
    if (startCondition()) {
      $("#visualize").css({"border-left": "solid #e60000 5px"})
      $("#start").css({"color": "white"})
    }else {
      $("#visualize").css({"border-left": "solid #1f1f1f 5px"})
      $("#start").css({"color": "#525252"})
    }
  })
}

function map_response_se(){
  $(".cell").on("click", function(){
    if (sidebar_function== "startNode") {
      pageStartnode.css({"background-color": "black"})
      pageStartnode= $(this)
      pageStartnode.css({"background-color": color_code_se.startNode})
    } else if (sidebar_function== "endNode") {
      pageEndnode.css({"background-color": "black"})
      pageEndnode= $(this)
      pageEndnode.css({"background-color": color_code_se.endNode})
    }
    if (startCondition()) {
      $("#visualize").css({"border-left": "solid #e60000 5px"})
      $("#start").css({"color": "white"})
    }else {
      $("#visualize").css({"border-left": "solid #1f1f1f 5px"})
      $("#start").css({"color": "#525252"})
    }
  })
}

// pfa functions

function get_se(){
  var rowCount = $('#mapTable>tbody>tr').length
  var colCount= $('#mapTable>tbody>tr:first>td').length
  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      var rgb_data= get_rgb([i, j])
      if (rgb_data== "rgb(99, 202, 216)") {
        var nodeStart= [i, j]
      }else if (rgb_data== "rgb(254, 124, 0)") {
        var nodeEnd= [i, j]
      }
    }
  }
  return [nodeStart, nodeEnd]
}

function get_rgb(cordinate_array){
  return $("#mapTable").find("tr:eq("+cordinate_array[0]+")").find("td:eq("+cordinate_array[1]+")").find("button").css("background-color")
}

function explore(cordinate_array){
  var i= cordinate_array[0]
  var j= cordinate_array[1]
  explorable_nodes= []
  // north
  var north_rgb= get_rgb([i-1, j])
  if (north_rgb!= 'rgb(0, 0, 0)' && i> 0) {
    explorable_nodes.push([i-1, j])
  }
  // east
  var east_rgb= get_rgb([i, j+1])
  if (east_rgb!= 'rgb(0, 0, 0)' && j< $('#mapTable>tbody>tr:first>td').length-1) {
    explorable_nodes.push([i, j+1])
  }
  // west
  var west_rgb= get_rgb([i, j-1])
  if (west_rgb!= 'rgb(0, 0, 0)' && j> 0 ) {
    explorable_nodes.push([i, j-1])
  }
  // south
  var south_rgb= get_rgb([i+1, j])
  if (south_rgb!= 'rgb(0, 0, 0)' && i< $('#mapTable>tbody>tr').length-1) {
    explorable_nodes.push([i+1, j])
  }
  return explorable_nodes
}

function cost(cordinate_array){
  var color_code= {"rgb(99, 202, 216)": 0, "rgb(254, 124, 0)": 0, "rgb(40, 204, 45)": 2, "rgb(255, 244, 79)": 4, "rgb(216, 46, 63)": 16}
  return color_code[get_rgb(cordinate_array)]
}

function heuristic(cordinate_array, nodeEnd){
  var i= cordinate_array[0]
  var j= cordinate_array[1]
  return ((nodeEnd[0]-i)**2 + (nodeEnd[1]-j)**2)**0.5
}

function pathCost(node, current_node, explored_nodes){
  var totalCost= cost(current_node)
  var explored_nodes_keys= makeArray(Object.keys(explored_nodes))
  for (var i = 0; i < explored_nodes_keys.length; i++) {
    totalCost= totalCost + cost(explored_nodes[current_node].via)
    current_node= explored_nodes[current_node].via
  }
  return totalCost
}

function arraysAreEqual(a, b){
  if (a.length!= b.length) {
    return false
  }else {
    for (var i = 0; i < a.length; i++) {
      if (a[i]!= b[i]) {
        return false
      }
    }
    return true
  }
}

function makeArray(cordinate_array){
  var conversion= []
  for (var i = 0; i < cordinate_array.length; i++) {
    var thisArray= cordinate_array[i].split(",")
    conversion.push([parseFloat(thisArray[0]), parseFloat(thisArray[1])])
  }
  return conversion
}

function dijkstra_pfa(){
  var nodes= get_se()
  var nodeStart= nodes[0]
  var nodeEnd= nodes[1]
  console.log(typeof(nodeStart), nodeStart, typeof(nodeEnd), nodeEnd);
  var current_node= nodeStart
  var explored_nodes= {[current_node]: {via: nodeStart}}
  var priority_q= {[current_node]: {cost: cost(current_node), pathCost: 0, via: nodeStart}}
  var cordinate_array= []
  while (true) {
    cordinate_array.push(current_node)
    if (arraysAreEqual(current_node, nodeEnd)) {
      break
    }
    var explorable_nodes= explore(current_node)
    if (arraysAreEqual(current_node, nodeStart) && explorable_nodes.length== 0) {
      return false
    }
    for (var i = 0; i < explorable_nodes.length; i++) {
      if (explorable_nodes[i].toString() in explored_nodes) {
        continue
      }else if (explorable_nodes[i].toString() in priority_q) {
        if (priority_q[explorable_nodes[i].toString()].pathCost> pathCost(explorable_nodes[i], current_node, explored_nodes)) {
          priority_q[explorable_nodes[i].toString()].pathCost= pathCost(explorable_nodes[i], current_node, explored_nodes)
          priority_q[explorable_nodes[i].toString()].via= explorable_nodes[i]
        }else {
          continue
        }
      }else {
        priority_q[explorable_nodes[i].toString()]= {cost: cost(explorable_nodes[i]), pathCost: pathCost(explorable_nodes[i], current_node, explored_nodes), via: current_node}
      }
    }
    delete priority_q[current_node]
    var priority_q_keys= makeArray(Object.keys(priority_q))
    var priority_q_keys_cost= []
    for (var i = 0; i < priority_q_keys.length; i++) {
      priority_q_keys_cost.push(priority_q[priority_q_keys[i]].cost)
    }
    var lowest= 0
    for (var i = 1; i < priority_q_keys_cost.length; i++) {
      if (priority_q_keys_cost[i] < priority_q_keys_cost[lowest]) {
        lowest= i
      }
    }
    for (var i = 0; i < priority_q_keys.length; i++) {
      var thisCost= priority_q_keys_cost[lowest]
      if (priority_q[priority_q_keys[i]].cost ==  thisCost && !arraysAreEqual(priority_q_keys[i], nodeStart)) {
        var next_node= priority_q_keys[i]
        break
      }
    }
    if (next_node.toString() in priority_q) {
      explored_nodes[next_node]= {via: priority_q[next_node].via}
    }else {
      explored_nodes[next_node]= {via: current_node}
    }
    if (arraysAreEqual(next_node, current_node)) {
      return false
    }else {
      current_node= next_node
    }
  }
  var explored_nodes_keys= makeArray(Object.keys(explored_nodes))
  var route= [nodeEnd]
  var route_end= nodeEnd
  for (var i = 0; i < explored_nodes_keys.length; i++) {
    route.push(explored_nodes[route_end].via)
    route_end= explored_nodes[route_end].via
    if (arraysAreEqual(route_end, nodeStart)) {
      break
    }
  }
  console.log(route)
  lightPath(cordinate_array, route)
}

function astar_pfa(){
  var nodes= get_se()
  var nodeStart= nodes[0]
  var nodeEnd= nodes[1]
  console.log(typeof(nodeStart), nodeStart, typeof(nodeEnd), nodeEnd);
  var current_node= nodeStart
  var explored_nodes= {[current_node]: {via: nodeStart}}
  var priority_q= {[current_node]: {cost: cost(current_node), heuristic: heuristic(current_node, nodeEnd), pathCost: 0, via: nodeStart}}
  var cordinate_array= []
  while (true) {
    cordinate_array.push(current_node)
    if (arraysAreEqual(current_node, nodeEnd)) {
      break
    }
    var explorable_nodes= explore(current_node)
    if (arraysAreEqual(current_node, nodeStart) && explorable_nodes.length== 0) {
      return false
    }
    for (var i = 0; i < explorable_nodes.length; i++) {
      if (explorable_nodes[i].toString() in explored_nodes) {
        continue
      }else if (explorable_nodes[i].toString() in priority_q) {
        if (priority_q[explorable_nodes[i].toString()].pathCost> pathCost(explorable_nodes[i], current_node, explored_nodes)) {
          priority_q[explorable_nodes[i].toString()].pathCost= pathCost(explorable_nodes[i], current_node, explored_nodes)
          priority_q[explorable_nodes[i].toString()].via= explorable_nodes[i]
        }else {
          continue
        }
      }else {
        priority_q[explorable_nodes[i].toString()]= {cost: cost(explorable_nodes[i]), heuristic: heuristic(explorable_nodes[i], nodeEnd), pathCost: pathCost(explorable_nodes[i], current_node, explored_nodes), via: current_node}
      }
    }
    delete priority_q[current_node]
    var priority_q_keys= makeArray(Object.keys(priority_q))
    var priority_q_keys_heuristic_cost= []
    for (var i = 0; i < priority_q_keys.length; i++) {
      priority_q_keys_heuristic_cost.push(priority_q[priority_q_keys[i]].cost + priority_q[priority_q_keys[i]].heuristic)
    }
    var lowest= 0
    for (var i = 1; i < priority_q_keys_heuristic_cost.length; i++) {
      if (priority_q_keys_heuristic_cost[i] < priority_q_keys_heuristic_cost[lowest]) {
        lowest= i
      }
    }
    for (var i = 0; i < priority_q_keys.length; i++) {
      var thisCost= priority_q_keys_heuristic_cost[lowest] - priority_q[priority_q_keys[i]].heuristic
      if (priority_q[priority_q_keys[i]].cost ==  thisCost.toFixed(2) && !arraysAreEqual(priority_q_keys[i], nodeStart)) {
        var next_node= priority_q_keys[i]
        break
      }
    }
    if (next_node.toString() in priority_q) {
      explored_nodes[next_node]= {via: priority_q[next_node].via}
    }else {
      explored_nodes[next_node]= {via: current_node}
    }
    if (arraysAreEqual(next_node, current_node)) {
      return false
    }else {
      current_node= next_node
    }
  }
  var explored_nodes_keys= makeArray(Object.keys(explored_nodes))
  var route= [nodeEnd]
  var route_end= nodeEnd
  for (var i = 0; i < explored_nodes_keys.length; i++) {
    route.push(explored_nodes[route_end].via)
    route_end= explored_nodes[route_end].via
    if (arraysAreEqual(route_end, nodeStart)) {
      break
    }
  }
  console.log(route)
  lightPath(cordinate_array, route)
}

function gbfs_pfa(){
  var nodes= get_se()
  var nodeStart= nodes[0]
  var nodeEnd= nodes[1]
  console.log(typeof(nodeStart), nodeStart, typeof(nodeEnd), nodeEnd);
  var current_node= nodeStart
  var explored_nodes= {[current_node]: {via: nodeStart}}
  var priority_q= {[current_node]: {heuristic: heuristic(current_node, nodeEnd), via: nodeStart}}
  var cordinate_array= []
  while (true) {
    cordinate_array.push(current_node)
    if (arraysAreEqual(current_node, nodeEnd)) {
      break
    }
    var explorable_nodes= explore(current_node)
    if (arraysAreEqual(current_node, nodeStart) && explorable_nodes.length== 0) {
      return false
    }
    for (var i = 0; i < explorable_nodes.length; i++) {
      if (explorable_nodes[i].toString() in explored_nodes) {
        continue
      }else if (explorable_nodes[i].toString() in priority_q) {
        continue
      }else {
        priority_q[explorable_nodes[i].toString()]= {heuristic: heuristic(explorable_nodes[i], nodeEnd), via: current_node}
      }
    }
    delete priority_q[current_node]
    var priority_q_keys= makeArray(Object.keys(priority_q))
    var priority_q_keys_heuristic= []
    for (var i = 0; i < priority_q_keys.length; i++) {
      priority_q_keys_heuristic.push(priority_q[priority_q_keys[i]].heuristic)
    }
    var lowest= 0
    for (var i = 1; i < priority_q_keys_heuristic.length; i++) {
      if (priority_q_keys_heuristic[i] < priority_q_keys_heuristic[lowest]) {
        lowest= i
      }
    }
    for (var i = 0; i < priority_q_keys.length; i++) {
      var thisCost= priority_q_keys_heuristic[lowest]
      if (priority_q[priority_q_keys[i]].heuristic ==  thisCost && !arraysAreEqual(priority_q_keys[i], nodeStart)) {
        var next_node= priority_q_keys[i]
        break
      }
    }
    if (next_node.toString() in priority_q) {
      explored_nodes[next_node]= {via: priority_q[next_node].via}
    }else {
      explored_nodes[next_node]= {via: current_node}
    }
    if (arraysAreEqual(next_node, current_node)) {
      return false
    }else {
      current_node= next_node
    }
  }
  var explored_nodes_keys= makeArray(Object.keys(explored_nodes))
  var route= [nodeEnd]
  var route_end= nodeEnd
  for (var i = 0; i < explored_nodes_keys.length; i++) {
    route.push(explored_nodes[route_end].via)
    route_end= explored_nodes[route_end].via
    if (arraysAreEqual(route_end, nodeStart)) {
      break
    }
  }
  console.log(route)
  lightPath(cordinate_array, route)
}

function startCondition(){
  var nodes= get_se()
  var nodeStart= nodes[0]
  var nodeEnd= nodes[1]
  if (typeof(nodeStart)== "undefined" || typeof(nodeEnd)== "undefined") {
    return false
  }
  //console.log(typeof(nodeStart), nodeStart, typeof(nodeEnd), nodeEnd);
  var current_node= nodeStart
  var explored_nodes= {[current_node]: {via: nodeStart}}
  var priority_q= {[current_node]: {cost: cost(current_node), heuristic: heuristic(current_node, nodeEnd), pathCost: 0, via: nodeStart}}
  while (true) {
    if (arraysAreEqual(current_node, nodeEnd)) {
      break
    }
    var explorable_nodes= explore(current_node)
    if (arraysAreEqual(current_node, nodeStart) && explorable_nodes.length== 0) {
      return false
    }
    for (var i = 0; i < explorable_nodes.length; i++) {
      if (explorable_nodes[i].toString() in explored_nodes) {
        continue
      }else if (explorable_nodes[i].toString() in priority_q) {
        continue
      }else {
        priority_q[explorable_nodes[i].toString()]= {heuristic: heuristic(explorable_nodes[i], nodeEnd), via: current_node}
      }
    }
    delete priority_q[current_node]
    var priority_q_keys= makeArray(Object.keys(priority_q))
    var priority_q_keys_heuristic= []
    for (var i = 0; i < priority_q_keys.length; i++) {
      priority_q_keys_heuristic.push(priority_q[priority_q_keys[i]].heuristic)
    }
    var lowest= 0
    for (var i = 1; i < priority_q_keys_heuristic.length; i++) {
      if (priority_q_keys_heuristic[i] < priority_q_keys_heuristic[lowest]) {
        lowest= i
      }
    }
    for (var i = 0; i < priority_q_keys.length; i++) {
      var thisCost= priority_q_keys_heuristic[lowest]
      if (priority_q[priority_q_keys[i]].heuristic ==  thisCost && !arraysAreEqual(priority_q_keys[i], nodeStart)) {
        var next_node= priority_q_keys[i]
        break
      }
    }
    if (next_node.toString() in priority_q) {
      explored_nodes[next_node]= {via: priority_q[next_node].via}
    }else {
      explored_nodes[next_node]= {via: current_node}
    }
    if (arraysAreEqual(next_node, current_node)) {
      return false
    }else {
      current_node= next_node
    }
  }
  var explored_nodes_keys= makeArray(Object.keys(explored_nodes))
  var route= [nodeEnd]
  var route_end= nodeEnd
  for (var i = 0; i < explored_nodes_keys.length; i++) {
    route.push(explored_nodes[route_end].via)
    route_end= explored_nodes[route_end].via
    if (arraysAreEqual(route_end, nodeStart)) {
      break
    }
  }
  //console.log(route)
  if (arraysAreEqual(route[0], nodeEnd) && arraysAreEqual(route[(route.length)-1], nodeStart)) {
    return true
  }else {
    return false
  }
}

function lightPath(cordinate_array, route){
  for (let i=0; i<cordinate_array.length; i++) {
   task(i)
  }
  function task(i) {
    setTimeout(function() {
       $("#mapTable>tbody>tr:eq("+cordinate_array[i][0]+")>td:eq("+cordinate_array[i][1]+")>button").css({"background-color": "#63CAD8"})
       if (arraysAreEqual(cordinate_array[i], route[0])) {
         lightRoute(route)
       }
    }, 100 * i)
  }
}

function lightRoute(route){
  for (let i=0; i<route.length; i++) {
   task(i)
  }
  function task(i) {
    setTimeout(function() {
       $("#mapTable>tbody>tr:eq("+route[route.length-1-i][0]+")>td:eq("+route[route.length-1-i][1]+")>button").css({"background-color": "white"})
    }, 50 * i)
  }
}

//


// page load script
$(document).ready(function(){
  $('#fade-title').delay(1500).fadeIn("slow")
})


// theme script
$(document).ready(function(){
  $("#mode").on("click", function(){
    $("body").toggleClass("dark-mode")
    $("#mode").toggleClass("dark-mode")
  })
})


// sidebar script
$(document).ready(function(){
  // mouseover function for sidebar buttons
  $("button").on("mouseover", function(){
    var color_code= {lowCost: "#28CC2D", mediumCost: "#FFF44F", highCost: "#D82E3F", wallNode: "black", startNode: "#63CAD8", endNode: "#FE7C00"}
    if (this.id=="start") {
      if ($("#visualize").css("border-left")== "5px solid rgb(230, 0, 0)") {
        $("#start").css({"color": "#e60000"})
      }
    }else if ($(this).hasClass("dropdown")) {
      $(this).css({"background-color": "white", "color": "#63CAD8"})
    }else if (this.id=="wallNode") {
      $(this).css({"background-color": color_code[this.id], "color": "white"})
    }else {
      $(this).css({"background-color": color_code[this.id], "color": "black"})
    }
  })
  $("button").on("mouseout", function(){
    if (this.id=="start") {
      if ($("#visualize").css("border-left")== "5px solid rgb(230, 0, 0)") {
        $("#start").css({"color": "white"})
      }
    }else if (!($(this).hasClass("cell"))) {
      $(this).css({"background-color": "#1f1f1f", "color": "white"})
    }
  })

  // dropdown menus
  $(".dropdown").on("click", function(){
    if (this.id== "algorithm-dropdown") {
      $(this).toggleClass(".button-on-select")
      $("#algorithm-menu").slideToggle("slow")
    }else if (this.id== "path-node-dropdown") {
      $(this).toggleClass(".button-on-select")
      $("#path-node-menu").slideToggle("slow")
    }else if (this.id== "map-settings-dropdown") {
      $(this).toggleClass(".button-on-select")
      $("#map-settings-menu").slideToggle("slow")
    }
  })
  $("button").on("click", function(){
    if (this.id== "dijkstra-algorithm") {
      $("#algorithm-menu").slideToggle("slow")
      $("#algorithm").html("Dijkstra")
      $("#chosen-algorithm").show("fast")
    }else if (this.id== "astar-algorithm") {
      $("#algorithm-menu").slideToggle("slow")
      $("#algorithm").html("A-Star")
      $("#chosen-algorithm").show("fast")
    }else if (this.id== "gbfs-algorithm") {
      $("#algorithm-menu").slideToggle("slow")
      $("#algorithm").html("Greedy Best First Search")
      $("#chosen-algorithm").show("fast")
    }else if (this.id== "lowCost") {
      $("#path-node-menu").slideToggle("slow")
      $("#path-node").html("Low Cost")
      $("#chosen-path-node").show("fast")
    }else if (this.id== "mediumCost") {
      $("#path-node-menu").slideToggle("slow")
      $("#path-node").html("Medium Cost")
      $("#chosen-path-node").show("fast")
    }else if (this.id== "highCost") {
      $("#path-node-menu").slideToggle("slow")
      $("#path-node").html("High Cost")
      $("#chosen-path-node").show("fast")
    }
  })
})


// map script
$(document).ready(function(){
  // map editing for path nodes
  $(".sidebar>div>button").on("click", function(){
    sidebar_function= this.id
    map_response()
    map_response_se()
  })
  // map editing for start and end node

  // slider script for cell size
  $("#size").on("input", function(){
    $(".cell").css({"height": $(this).val(), "width": $(this).val()})
  })
  // slider script for number of rows
  $("#rows").on("input", function(){
    var rowCount = $('#mapTable>tbody>tr').length
    var colCount= $('#mapTable>tbody>tr:first>td').length
    var tdVal= ""
    var trVal= ""
    if (rowCount< $(this).val()) {
      for (var i = 0; i < ($(this).val())-rowCount; i++) {
        for (var i = 0; i < colCount; i++) {
          tdVal= tdVal+"<td><button class='cell' style= 'height: "+$("#size").val()+"px; width: "+$("#size").val()+"px;'></button></td>\n"
        }
        trVal= trVal+"<tr>\n"+tdVal+"</tr>"
      }
      $("#mapTable>tbody").append(trVal)
    }else if (rowCount> $(this).val()) {
      for (var i = 0; i < rowCount-($(this).val()); i++) {
        $("#mapTable>tbody>tr:last").remove()
      }
    }
  })
  // slider script for number of columns
  $("#columns").on("input", function(){
    var rowCount = $('#mapTable>tbody>tr').length
    var colCount= $('#mapTable>tbody>tr:first>td').length
    var tdVal= ""
    if (colCount< $(this).val()) {
      for (var i = 0; i < ($(this).val())-colCount; i++) {
        tdVal= tdVal+"<td><button class='cell' style= 'height: "+$("#size").val()+"px; width: "+$("#size").val()+"px;'></button></td>\n"
      }
      $("#mapTable>tbody>tr").append(tdVal)
    }else if (colCount> $(this).val()) {
      for (var i = 0; i < colCount-($(this).val()); i++) {
        $("#mapTable>tbody>tr>td:last-child").remove()
      }
    }
  })
})
