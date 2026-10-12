from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from django.contrib.auth.password_validation import validate_password


class SignupSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        password = attrs["password"]
        confirm_password = attrs["confirm_password"]

        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        validate_password(password)

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User(**validated_data)
        user.set_password(validated_data["password"])
        user.save()

        return user

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
            "dob",
            "profile_picture",
        ]
        extra_kwargs = {"password": {"write_only": True}}


class LoginSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid username or password.")

        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "dob",
            "profile_picture",
        ]
        read_only_fields = ["username", "email"]
