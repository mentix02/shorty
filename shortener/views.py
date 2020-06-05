from django.conf import settings
from django.core.cache import cache
from django.shortcuts import get_object_or_404, redirect, render
from django.core.cache.backends.base import DEFAULT_TIMEOUT

from ipware import get_client_ip

from shortener.models import URL

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def index(request):
    return render(request, 'index.html')


def root(request, url_hash):

    ip, routable = get_client_ip(request)

    url = cache.get(url_hash, None)

    if url is None:
        url = get_object_or_404(URL, url_hash=url_hash)
        cache.set(url_hash, url, timeout=CACHE_TTL)

    user_agent = request.user_agent

    url.clicked(
        ip, user_agent.os.family, user_agent.device.family, user_agent.browser.family
    )

    return redirect(url.full_url)


def stats(request):
    return render(request, 'stats.html')
