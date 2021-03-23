from django.urls import path
from visualizer import views

app_name= "visualizer"

urlpatterns = [
    path('dijkstra/', views.dijkstra, name= "dijkstra"),
    path('astar/', views.astar, name= "astar"),
    path('gbfs/', views.gbfs, name= "gbfs"),
    path('visualize/', views.visualize, name= "visualize"),
]
