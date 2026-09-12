from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User


class SignupTest(APITestCase):

    def test_user_signup(self):

        url = reverse("signup")

        data = {
            "username": "aman",
            "first_name": "Aman",
            "last_name": "Kumar",
            "email": "aman@test.com",
            "password": "Aman@123",
            "confirm_password": "Aman@123",
            "dob": "2004-03-05",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            User.objects.count(),
            1,
        )

        self.assertEqual(
            User.objects.get().username,
            "aman",
        )

        self.assertEqual(
            User.objects.get().email,
            "aman@test.com",
        )
