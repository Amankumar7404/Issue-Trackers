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

    def test_user_signup_password_mismatch(self):

        url = reverse("signup")

        data = {
            "username": "aman2",
            "first_name": "Aman",
            "last_name": "Kumar",
            "email": "aman2@test.com",
            "password": "Aman@123",
            "confirm_password": "Wrong@123",
            "dob": "2004-03-05",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            User.objects.count(),
            0,
        )

    def test_user_signup_weak_password(self):

        url = reverse("signup")

        data = {
            "username": "weakuser",
            "first_name": "Weak",
            "last_name": "User",
            "email": "weak@test.com",
            "password": "123",
            "confirm_password": "123",
            "dob": "2004-03-05",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            User.objects.count(),
            0,
        )

    def test_user_signup_duplicate_username(self):

        User.objects.create_user(
            username="aman",
            email="existing@test.com",
            password="Aman@123",
        )

        url = reverse("signup")

        data = {
            "username": "aman",
            "first_name": "Another",
            "last_name": "User",
            "email": "another@test.com",
            "password": "Another@123",
            "confirm_password": "Another@123",
            "dob": "2004-03-05",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            User.objects.count(),
            1,
        )

    def test_user_signup_duplicate_email(self):

        User.objects.create_user(
            username="existing",
            email="aman@test.com",
            password="Aman@123",
        )

        url = reverse("signup")

        data = {
            "username": "another",
            "first_name": "Another",
            "last_name": "User",
            "email": "aman@test.com",
            "password": "Another@123",
            "confirm_password": "Another@123",
            "dob": "2004-03-05",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            User.objects.count(),
            1,
        )


class LoginTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="aman",
            email="aman@test.com",
            password="Aman@123",
            first_name="Aman",
            last_name="Kumar",
            dob="2004-03-05",
        )

    def test_user_login(self):

        url = reverse("login")

        data = {
            "username": "aman",
            "password": "Aman@123",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )

        self.assertNotIn(
            "password",
            response.data,
        )

    def test_user_login_wrong_password(self):

        url = reverse("login")

        data = {
            "username": "aman",
            "password": "WrongPassword@123",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class ProfileTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="aman",
            email="aman@test.com",
            password="Aman@123",
            first_name="Aman",
            last_name="Kumar",
            dob="2004-03-05",
        )

        self.client.force_authenticate(user=self.user)

    def test_get_profile_unauthenticated(self):

        self.client.force_authenticate(user=None)

        url = reverse("profile")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_get_profile(self):

        url = reverse("profile")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            "aman",
        )

        self.assertEqual(
            response.data["email"],
            "aman@test.com",
        )

    def test_update_profile(self):

        url = reverse("profile")

        data = {
            "first_name": "Aman Updated",
            "last_name": "Kumar Updated",
        }

        response = self.client.put(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.first_name,
            "Aman Updated",
        )

        self.assertEqual(
            self.user.last_name,
            "Kumar Updated",
        )

        self.assertEqual(
            response.data["data"]["first_name"],
            "Aman Updated",
        )

    def test_update_profile_unauthenticated(self):

        self.client.force_authenticate(user=None)

        url = reverse("profile")

        data = {
            "first_name": "Hacked",
        }

        response = self.client.put(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.first_name,
            "Aman",
        )

    def test_update_profile_invalid_dob(self):

        url = reverse("profile")

        data = {
            "dob": "invalid-date",
        }

        response = self.client.put(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            str(self.user.dob),
            "2004-03-05",
        )

    def test_user_login_nonexistent_user(self):

        url = reverse("login")

        data = {
            "username": "doesnotexist",
            "password": "Aman@123",
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
