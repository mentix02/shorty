from django.urls import path
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from django.views.decorators.csrf import csrf_exempt

from graphene_django.views import GraphQLView

from shortener.views import root, stats, index

favicon_view = RedirectView.as_view(url='/static/imgs/icon.png', permanent=True)

urlpatterns = [
    path('', index, name='index'),
    path('stats/', stats, name='stats'),
    path('admin/', admin.site.urls, name='admin'),
    path('favicon.ico', favicon_view, name='favicon'),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True)), name='graphql'),
    path('<str:url_hash>/', root, name='root'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
