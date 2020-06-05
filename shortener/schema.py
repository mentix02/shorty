from urllib.parse import urlparse

from django.conf import settings
from django.core.cache import cache
from django.db.models import Q, Count
from django.core.cache.backends.base import DEFAULT_TIMEOUT

import graphene
from graphene_django import DjangoObjectType

from shortener.models import URL, Click

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


class ClickType(DjangoObjectType):
    id = graphene.Int()
    timestamp = graphene.DateTime()

    class Meta:
        model = Click


class URLType(DjangoObjectType):
    id = graphene.Int()
    click_count = graphene.Int(source='click_count')
    full_url_hash = graphene.String(source='full_url_hash')

    class Meta:
        model = URL


class Query(graphene.ObjectType):

    url = graphene.Field(
        URLType, full_url=graphene.String(), url_hash=graphene.String()
    )
    urls = graphene.List(
        URLType,
        skip=graphene.Int(),
        first=graphene.Int(),
        url_kw=graphene.String(),
        most_used=graphene.Boolean(),
    )

    # noinspection PyMethodMayBeStatic
    def resolve_urls(
        self, _, url_kw=None, first=None, skip=None, most_used=None, **__
    ):

        queryset = cache.get('urls', None)

        if queryset is None:
            queryset = URL.objects.all()
            cache.set('urls', queryset, timeout=CACHE_TTL)

        if most_used:
            return queryset.annotate(num_clicks=Count('clicks')).order_by(
                '-num_clicks'
            )[:5]

        if url_kw:
            _filter = Q(full_url__icontains=url_kw)
            queryset = queryset.filter(_filter)

        if first:
            queryset = queryset[:first]
        if skip:
            queryset = queryset[skip:]

        return queryset

    # noinspection PyMethodMayBeStatic
    def resolve_url(self, _, full_url: str = None, url_hash: str = None, **__):
        if full_url is not None:
            return URL.objects.get(full_url=full_url)
        if url_hash is not None:
            return URL.objects.get(url_hash=url_hash[url_hash.rfind('/') + 1:])
        return None


class CreateURL(graphene.Mutation):
    url = graphene.Field(URLType)

    class Arguments:
        full_url = graphene.String()

    def mutate(self, _, full_url):

        parsed_url = urlparse(full_url)
        scheme_len = len(parsed_url.scheme)

        if parsed_url.netloc.startswith('www'):
            full_url = full_url[: scheme_len + 3] + full_url[scheme_len + 7:]

        url, created = URL.objects.get_or_create(full_url=full_url)
        # noinspection PyArgumentList
        return CreateURL(url=url)


class Mutation(graphene.ObjectType):
    create_url = CreateURL.Field()
