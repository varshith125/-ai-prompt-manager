# api/views.py

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from datetime import datetime
import os
import logging

from .serializers import *
from .logic import *

logger = logging.getLogger(__name__)

# Blockchain is optional - handled inside logic.py
# Set BLOCKCHAIN_ENABLED=True in env to enable blockchain storage
BLOCKCHAIN_ENABLED = os.getenv('BLOCKCHAIN_ENABLED', 'False') == 'True'


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": tokens
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )


# 🔗 BLOCKCHAIN + DATABASE INTEGRATION
class ChatHistoryCreateView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        chat_data = request.data.copy()

        chat_data.update({
            'user': request.user.id if request.user.is_authenticated else None,
            'timestamp': datetime.now().isoformat()
        })

        # Always save to Django DB first
        try:
            serializer = ChatHistorySerializer(data={
                'prompt': chat_data.get('prompt', ''),
                'response': chat_data.get('response', ''),
            })
            serializer.is_valid(raise_exception=True)
            user = request.user if request.user.is_authenticated else None
            instance = serializer.save(user=user)
        except Exception as e:
            logger.error(f"DB save error: {e}")
            return Response(
                {'error': f'Failed to save: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optionally store in blockchain (only when enabled + Ganache running)
        if BLOCKCHAIN_ENABLED:
            try:
                result = addData(chat_data)
                if result != "Success":
                    logger.warning(f"Blockchain storage failed: {result}")
            except Exception as e:
                logger.warning(f"Blockchain error (non-fatal): {e}")

        return Response(
            ChatHistorySerializer(instance).data,
            status=status.HTTP_201_CREATED
        )


class CategoryCreateView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = CategorySerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = request.user if request.user.is_authenticated else None

        instance = serializer.save(user=user)

        return Response(
            CategorySerializer(instance).data,
            status=status.HTTP_201_CREATED
        )


class UserChatHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = []

        for i in retriveData():

            if int(i.get('user', '')) == request.user.id:

                data.append(i)

        return Response(data, status=status.HTTP_200_OK)


class UserCategoryFilterView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, category_name):

        user = request.user

        data = Category.objects.filter(
            user=user,
            category__iexact=category_name
        ).order_by('-timestamp')

        serializer = CategorySerializer(data, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UserCategoryListDistinctView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        categories = Category.objects.filter(
            user=request.user
        ).values_list("category", flat=True).distinct()

        return Response(list(categories), status=status.HTTP_200_OK)


class AddCategoryView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AddCategorySerializers(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        instance = serializer.save()

        return Response(
            AddCategorySerializers(instance).data,
            status=status.HTTP_201_CREATED
        )

    def get(self, request):

        user = request.user

        categories = AddCategories.objects.filter(user=user)

        serializer = AddCategorySerializers(categories, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class AllCategoriesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        data = AddCategories.objects.filter(user=user).order_by('-timestamp')

        serializer = get_CategorySerializer(data, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateUserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        user = request.user

        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response({
            "message": "Profile updated",
            "user": serializer.data
        })