# models.py
from django.db import models
from django.contrib.auth.models import User

class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    prompt = models.TextField(null=True, blank=True)
    response = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # user is nullable → guard it
        return self.user.username if self.user else "Anonymous"

    class Meta:
        db_table = "chat_history"


class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    category = models.TextField(null=True, blank=True)
    prompt = models.TextField(null=True, blank=True)
    response = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # there is no 'name' field → use 'category'
        return self.category or "Unnamed Category"

    class Meta:
        db_table = "category"

class AddCategories(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    category_name = models.CharField(max_length=50, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'add_categories'
