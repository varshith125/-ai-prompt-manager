# api/serializers.py
from django.contrib.auth import get_user_model, password_validation
from django.core import exceptions
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # add/remove fields as you need
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    # write-only password so it never comes back in responses
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password"]

    def validate(self, attrs):
        # Run Django’s password validators (AUTH_PASSWORD_VALIDATORS)
        user = User(**{k: v for k, v in attrs.items() if k in ["username", "email", "first_name", "last_name"]})
        pw = attrs.get("password")
        try:
            password_validation.validate_password(pw, user)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, validated_data):
        # Use create_user to hash password properly
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


def get_tokens_for_user(user):
    """Utility to mint access/refresh tokens for a user."""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class LoginSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT login to also return basic user info.
    POST {username, password} -> {refresh, access, user:{...}}
    """
    def validate(self, attrs):
        data = super().validate(attrs)  # does auth & returns tokens
        data["user"] = UserSerializer(self.user).data
        return data
    
class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ["id", "user", "prompt", "response", "timestamp"]
        read_only_fields = ["id", "timestamp", "user"]  # <- user read-only

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "user", "category", "prompt", "response", "timestamp"]
        read_only_fields = ["id", "timestamp", "user"]  # <- user read-only

class AddCategorySerializers(serializers.ModelSerializer):
    class Meta:
        model = AddCategories
        fields = ["id", "category_name", "timestamp"]
        read_only_fields = ["id", "timestamp"]
    
    def create(self, validated_data):
        user = self.context.get('request').user if self.context.get('request') else None
        instance = AddCategories.objects.create(user=user, **validated_data)
        return instance

class get_CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AddCategories
        fields = ["id", "category_name", "timestamp"]
        read_only_fields = ["id", "timestamp"]