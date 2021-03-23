from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "visualizer/index.html")

def dijkstra(request):
    return render(request, "visualizer/dijkstra.html")

def astar(request):
    return render(request, "visualizer/astar.html")

def gbfs(request):
    return render(request, "visualizer/gbfs.html")

def visualize(request):
    return render(request, "visualizer/visualize.html")
