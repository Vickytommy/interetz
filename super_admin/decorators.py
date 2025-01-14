# # super_admin/decorators.py
# from functools import wraps
# from django.shortcuts import redirect, render

# def role_required(allowed_roles=[]):
#     def decorator(view_func):
#         @wraps(view_func)
#         def wrapper(request, *args, **kwargs):
#             if not request.user.is_authenticated:
#                 # Redirect to the login page if the user is not authenticated
#                 return redirect('super_admin:loginSuperAdmin')  # Change 'login' to your login URL name

#             if request.user.role.name not in allowed_roles:
#                 # Redirect to a forbidden page or handle unauthorized access
#                 return render(request, 'super_admin/pages-500.html')  # Change 'forbidden.html' to your forbidden template

#             return view_func(request, *args, **kwargs)

#         return wrapper

#     return decorator

from functools import wraps
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import user_passes_test

def role_required(allowed_roles=[]):
    def check_role(user):
        return user.is_authenticated and user.role.name in allowed_roles and user.is_active
    return user_passes_test(check_role, login_url='super_admin:loginSuperAdmin')

