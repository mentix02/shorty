from hashlib import md5

from django.db import models
from django.conf import settings
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

from graphql import GraphQLError


class URL(models.Model):
    full_url = models.URLField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    url_hash = models.CharField(unique=True, max_length=10)

    def clicked(self, ip=None, os=None, device=None, browser=None):
        Click.objects.create(url=self, ip=ip, os=os, device=device, browser=browser)

    @property
    def clicks(self):
        return self.clicks

    @property
    def click_count(self):
        return self.clicks.count()

    @property
    def full_url_hash(self):
        return f'{settings.BASE_URL}/{self.url_hash}'

    def save(self, *args, **kwargs):
        if not self.id:
            self.url_hash = md5(self.full_url.encode()).hexdigest()[:10]

        validate = URLValidator()
        try:
            validate(self.full_url)
        except ValidationError:
            raise GraphQLError('invalid url')

        return super().save(*args, **kwargs)

    def __str__(self):
        return self.url_hash


class Click(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    os = models.CharField(default='Other', max_length=200)
    ip = models.GenericIPAddressField(null=True, blank=True)
    device = models.CharField(default='Other', max_length=200)
    browser = models.CharField(default='Other', max_length=200)
    url = models.ForeignKey(URL, on_delete=models.CASCADE, related_name='clicks')
