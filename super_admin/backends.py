from django.contrib.auth.backends import ModelBackend
from super_admin.models import Role, EliteNovaUser
from django.contrib.auth.hashers import check_password

class CustomBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = EliteNovaUser.objects.get(employee_email=email)
            password_match = check_password(password, user.password)
            if password_match:
                return user
            else:
                print("pass not matched")
        except EliteNovaUser.DoesNotExist as e:
            print(e)
            return None
        
       
        return None

    def get_user(self, id):
        try:
            return EliteNovaUser.objects.get(pk=id)
        except EliteNovaUser.DoesNotExist:
            return None
