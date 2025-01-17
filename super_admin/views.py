#!/usr/bin/env python
# -*- coding: utf8 -*-
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .decorators import role_required
from .models import EliteNovaUser, Role, Drawer, ColorKnob, Knob, Collection, OrderTrack, helperTables, DrawarOrder, ClapOrder, HingeOrder, Cards, OrderItems, RelatedOrders, Translations
import json
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from django.db import IntegrityError
from django.urls import reverse
import datetime
from django.http import JsonResponse
import pandas as pd
import time, random
from django.contrib.auth import get_user_model
from os.path import splitext
import string
from django.core.serializers import serialize
from django.forms.models import model_to_dict
import secrets
from datetime import datetime
import mimetypes
import os
from django.conf import settings
import pytz
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.utils import timezone
from django.db import connection
from django.template.loader import render_to_string
from django.http import HttpResponse
def get_translation(page):
    trans = Translations.objects.filter(translation_page_name = page)
    data = {
        tran.translation_english_verion: tran.translation_hebrew_verion
        for tran in trans
    }
    return data

def get_menus_translation(request):
    sql_query = "select * from super_admin_translations where translation_page_name=translation_english_verion"
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        rows = cursor.fetchall()
    result1 = {
        row[2]: row[3]  # Assuming row[0] is translation_english_verion and row[1] is translation_hebrew_verion
        for row in rows
    }

    sql_query2 = """SELECT * 
    FROM super_admin_translations 
    WHERE translation_page_name = 'create new order' 
    AND translation_english_verion IN ('door', 'formica', 'plates','create new order ')"""
    with connection.cursor() as cursor:
        cursor.execute(sql_query2)
        rows = cursor.fetchall()
    result2 = {
        row[2]: row[3]  # Assuming row[0] is translation_english_verion and row[1] is translation_hebrew_verion
        for row in rows
    }

    sql_query3 = """select * from super_admin_translations where translation_page_name='products'
                    and translation_english_verion in ('collection','knob color','knobs','drawers');
                """

    with connection.cursor() as cursor:
        cursor.execute(sql_query3)
        rows = cursor.fetchall()
    result3 = {
        row[2]: row[3]  # Assuming row[0] is translation_english_verion and row[1] is translation_hebrew_verion
        for row in rows
    }


    query4 = "select * from super_admin_translations where translation_page_name='Topbar'"
    with connection.cursor() as cursor:
        cursor.execute(query4)
        rows = cursor.fetchall()
    result4 = {
        row[2]: row[3]  # Assuming row[0] is translation_english_verion and row[1] is translation_hebrew_verion
        for row in rows
    }
    dic = {**result1, **result2, **result3, **result4}
    request.session.update(dic)
    
    #print(request.session)
    

def format_registered_date(data):
    datetime_string = str(data)
    datetime_obj = datetime.strptime(datetime_string, '%Y-%m-%d %H:%M:%S.%f%z')

    # Convert to the desired time zone (e.g., Asia/Karachi)
    time_zone = settings.TIME_ZONE
    desired_time_zone = pytz.timezone(time_zone)
    datetime_obj = datetime_obj.astimezone(desired_time_zone)

    # Format the datetime as string in the desired format %Y-%m-%d
    return datetime_obj.strftime('%H:%M %d/%m/%Y')


def generate_password():
    length = random.randint(12, 20)
    # Define the character set for generating the password
    characters = string.ascii_letters + string.digits  # Includes uppercase and lowercase letters, digits, and punctuation symbols

    # Generate a random password using the defined character set
    password = ''.join(secrets.choice(characters) for _ in range(length))

    return password


def generate_random_string():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=6))

@receiver(user_logged_in)
def update_last_login(sender, user, request, **kwargs):
    user.last_login = timezone.now()
    user.save()

def loginSuperAdmin(request):
    translations = get_translation('log in')
    context = {'data': translations}
    if request.method == "POST":
        user_email = request.POST.get('username')
        userpassword = request.POST.get('userpassword')
        user = authenticate(request, email=user_email, password=userpassword)
        if user is not None:
            if user.is_active: # check user is active
                login(request, user)
                return redirect('super_admin:home')
            else:
                context['error_message'] = translations['Your account is not active, please contact to admin for recovery']
                return render(request, 'super_admin/super_admin_login.html',context)
        else:
            # Return an 'invalid login' error message.
            context['error_message'] = translations['Invalid login credentials']
            return render(request, 'super_admin/super_admin_login.html', context)
    
    return render(request, 'super_admin/super_admin_login.html', context)


@role_required(allowed_roles=['super admin','client','admin'])
def home(request):
    get_menus_translation(request)
    translations = get_translation('welcome to elite nova')
    return render(request, 'super_admin/index.html', context={'data':translations})

# For managing super admin and super admin & admin password/change password
@role_required(allowed_roles=['super admin'])
def addSuperAdmin(request):
    
    if request.method == 'POST':
        translations = get_translation('super admin')
        entry_type = request.POST.get('entry_type')
        if entry_type == 'single':
            company_name = request.POST.get('company_name')
            company_id = request.POST.get('company_id') 
            # employee_id = request.POST.get('employee_id')
            employee_name = request.POST.get('employee_name')
            employee_last_name = request.POST.get('employee_last_name')
            employee_email = request.POST.get('employee_email')
            employee_phone = request.POST.get('employee_phone')
            employee_password = request.POST.get('employee_password')
            user_role = request.POST.get('user_role')
            # for save case
            super_admin_id = request.POST.get('super_admin_id')
            
            if super_admin_id is None: # for insert case
                existing_user = EliteNovaUser.objects.filter(employee_email=employee_email).count()
                # existing_user_name = EliteNovaUser.objects.filter(username=employee_name).count()
                if existing_user > 0:
                    return JsonResponse({'msg': translations['Super Admin with entered email is already exists'], 'success':False})

                
                if existing_user == 0:
                    role = Role.objects.get(name=user_role)
                    new_user = EliteNovaUser(
                        role=role,
                        company_name=company_name,
                        company_id=company_id,
                        # employee_id=employee_id,
                        employee_name=employee_name,
                        employee_last_name=employee_last_name,
                        employee_email=employee_email,
                        email=employee_email,
                        phone_number=employee_phone,
                        password= make_password(employee_password), # hashing the pass
                        plain_password = employee_password,
                        is_active = True,
                        is_staff = False,
                        is_superuser = False,
                        # username = employee_name,
                    )
                    new_user.save()
                    #if new_user:
                    return JsonResponse({'msg': translations['Super Admin has been created'], 'success':True})
                else:
                    return JsonResponse({'msg':translations['Super Admin with this email is already exists'], 'success':False})
                    #return render(request, 'super_admin/add_super_admin.html',{'msg': 'Super Admin with this email is already exists', 'success':False})
            else: # for update case
                super_admin_id = int (super_admin_id)
                is_active = True if (int(request.POST.get('is_active'))) == 1 else False
                existing_user = EliteNovaUser.objects.get(id = super_admin_id)
                if existing_user:
                    existing_user.company_name=company_name
                    existing_user.company_id=company_id
                    # existing_user.employee_id=employee_id
                    existing_user.employee_name=employee_name
                    existing_user.employee_last_name=employee_last_name
                    existing_user.employee_email=employee_email
                    existing_user.email=employee_email
                    existing_user.phone_number=employee_phone
                    existing_user.password= make_password(employee_password) # hashing the pass
                    existing_user.plain_password = employee_password
                    # existing_user.username = employee_name
                    existing_user.is_active = is_active
                    try:
                        existing_user.save()
                        return JsonResponse({'msg': translations['Super Admin details has been updated'], 'success':True})
                    except IntegrityError as e:
                        return JsonResponse({'msg': translations["Save failed"], 'success':False})
                else:
                    return JsonResponse({'msg': translations["Save failed"], 'success':False})
        else:
            expected_columns = ["company_name","company_id","employee_name","account_password","employee_last_name","employee_email_address","employee_phone"]
            response = []
            success_ = 0
            user_role = request.POST.get('user_role')
            if 'bulk_upload_file' in request.FILES and request.FILES['bulk_upload_file']!='':
                df = pd.read_csv(request.FILES['bulk_upload_file'])
                df = df.fillna('')
                role = Role.objects.get(name=user_role)
                if len(df) > 0:
                    if set(df.columns) == set(expected_columns):
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):
                            existing_user = EliteNovaUser.objects.filter(employee_email=row_data["employee_email_address"]).count()
                            # existing_user_name = EliteNovaUser.objects.filter(username=row_data["employee_name"]).count()
                            if existing_user > 0:
                                response.append({'msg': f'User with index#{index+1} {row_data["employee_email_address"]} or {row_data["employee_name"]} is already exists', 'success':False})
                            else:
                                account_password = row_data['account_password']
                                if account_password=='':
                                    account_password = generate_password()
                                new_user = EliteNovaUser.objects.create(
                                        role=role,
                                        company_name=row_data["company_name"],
                                        company_id=row_data["company_id"],
                                        # employee_id=row_data[""],
                                        employee_name=row_data["employee_name"],
                                        employee_last_name=row_data["employee_last_name"],
                                        employee_email=row_data["employee_email_address"],
                                        email=row_data["employee_email_address"],
                                        phone_number=row_data["employee_phone"],
                                        password= make_password(account_password), # hashing the pass
                                        plain_password = account_password,
                                        is_active = True,
                                        is_staff = False,
                                        is_superuser = False,
                                        # username = row_data["employee_name"],
                                )
                                success_+=1
                            
                        return JsonResponse({'msg': translations ['Super Admins has been added successfully'], 'success':1,'track':response, 'insert_count':success_})
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only {len(expected_columns)} and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    translations_product = get_translation('products')
                    return JsonResponse({'msg': translations_product['Uploaded file must have some data, its seems empty file'], 'success':0})
            else:
                return JsonResponse({'msg': translations_product['Uploaded file must have some data, its seems empty file'], 'success':0})

    else:
        translations = get_translation('super admin')
        entry_type = request.GET.get('entry_type')
        context = {'entry_type':entry_type, 'data':translations,'data_table':get_translation('Reservation'),'login_data':get_translation('log in')
            ,'product_data':get_translation('products')
        }
        
        return render(request, 'super_admin/add_super_admin.html', context=context)

def editSuperAdmin(request, super_admin_id):
    #super_admin = get_object_or_404(EliteNovaUser, id=super_admin_id)
    super_admin = EliteNovaUser.objects.filter(id=super_admin_id).values().first()
    super_admin['is_active_bool'] = 1 if super_admin['is_active'] else 0
    
    translations = get_translation('super admin')

    context = {'super_admin': super_admin, 'data':translations,'data_table':get_translation('Reservation'),'login_data':get_translation('log in')}
    return render(request, 'super_admin/edit_super_admin.html', context=context)



@role_required(allowed_roles=['super admin'])
def viewSuperAdmin(request):
    user_id = request.user.id
    users_query_set = EliteNovaUser.objects.filter(Q(role_id=1) , ~Q(id=user_id))
    users_list_of_dicts = list(users_query_set.values())
    translations = get_translation('super admin')
    # translations = get_translation('products')
    context = {'data': translations, "super_admins":users_list_of_dicts, 'data_products':get_translation('products'), 'data_table':get_translation('Reservation')}
    return render(request, 'super_admin/super_admin_list.html', context=context)

@role_required(allowed_roles=['super admin'])
def getSuperAdmininfo(request): # this will help me for getting complete info of all kind of user
    if request.method == "POST":
        user_id = int(request.POST.get('user_id'))
        user_query_set = EliteNovaUser.objects.filter(Q(id=user_id))
        user_list_of_dict = list(user_query_set.values())
        if user_list_of_dict:
            # del user_list_of_dict[0]['employee_id']
            del user_list_of_dict[0]['plain_password']
            del user_list_of_dict[0]['password']
            user_list_of_dict[0]['employee_id'] = user_list_of_dict[0]['id']
            del user_list_of_dict[0]['id']
            del user_list_of_dict[0]['registered_date']
            #user_list_of_dict[0]['registered_date'] = format_registered_date(user_list_of_dict[0]['registered_date'])
            user_list_of_dict[0]['date_joined'] = format_registered_date(user_list_of_dict[0]['date_joined'])

        # translations = get_translation('super admin')
            
        return JsonResponse(user_list_of_dict,safe=False)

@role_required(allowed_roles=['super admin'])
def deleteSuperAdmin(request):  # this will help me for deleting of all kind of user
    if request.method == "POST":
        translations = get_translation('products')
        user_id = int(request.POST.get('user_id'))
        obj_to_delete = get_object_or_404(EliteNovaUser, id=user_id)
        if obj_to_delete.delete():
            return JsonResponse({"success":1, "msg":translations["Record has been deleted successfullly"]}, safe=False)
        else:
            return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)


@role_required(allowed_roles=['super admin'])
def viewSuperAdminProfile(request):
    return render(request, 'super_admin/super_admin_profile.html')

@role_required(allowed_roles=['super admin', 'client','admin'])
def changePassword(request):
    trans = get_translation('changePassword')
    if request.method == "POST":
        new_password = request.POST.get('new_password')
        current_password = request.POST.get('current_password')
        user_id =  int(request.POST.get('user_id'))
        existing_user = EliteNovaUser.objects.get(id = user_id)
        if existing_user:
            if existing_user.plain_password != current_password:
                return JsonResponse({'success':0, 'msg':trans['The current password is wrong']})
            else:
                existing_user.plain_password = new_password
                existing_user.password = make_password(new_password)
                existing_user.save()
                return JsonResponse({'success':1, 'msg':trans['The password has been updated successfully']})
        else:
            return JsonResponse({'success':0, 'msg':trans['The user does not exists in databases']})
    else:
        context = {'data':trans, 'super_admin_data':get_translation('super admin')}
        return render(request, 'super_admin/change_super_admin_password.html',context = context)

# def hebrew_menus(request):
#     if request.method == 'POST':
#         translations = get_menus_translation(request)
#         return JsonResponse({'data': translations}, safe=False)

def SuperAdminLogout(request):
    translations = get_translation('log in')
    logout(request)
    context = {'data': translations}
    return render(request, 'super_admin/super_admin_login.html', context)

@role_required(allowed_roles=['super admin'])
def addAdmin(request):
    
    if request.method == 'POST':
        translations = get_translation('admin')
        entry_type = request.POST.get('entry_type')
        if entry_type == "single":
            company_name = request.POST.get('company_name')
            company_id = request.POST.get('company_id') 
            # employee_id = request.POST.get('employee_id')
            employee_name = request.POST.get('employee_name')
            employee_last_name = request.POST.get('employee_last_name')
            employee_email = request.POST.get('employee_email')
            employee_phone = request.POST.get('employee_phone')
            employee_password = request.POST.get('employee_password')
            user_role = request.POST.get('user_role')
            # for save case
            admin_id = request.POST.get('admin_id')
            
            if admin_id is None: # for insert case
                existing_user = EliteNovaUser.objects.filter(employee_email=employee_email).count()
                # existing_user_name = EliteNovaUser.objects.filter(username=employee_name).count()
                if existing_user > 0:
                    return JsonResponse({'msg': translations['Admin with entered email is already exists'], 'success':False})

                
                if existing_user == 0:
                    role = Role.objects.get(name=user_role)
                    new_user = EliteNovaUser(
                        role=role,
                        company_name=company_name,
                        company_id=company_id,
                        employee_id='',
                        employee_name=employee_name,
                        employee_last_name=employee_last_name,
                        employee_email=employee_email,
                        email=employee_email,
                        phone_number=employee_phone,
                        password= make_password(employee_password), # hashing the pass
                        plain_password = employee_password,
                        is_active = True,
                        is_staff = False,
                        is_superuser = False,
                        # username = employee_name,
                    )
                    new_user.save()
                    return JsonResponse({'msg': translations['Admin has been created'], 'success':True})
                else:
                    return JsonResponse({'msg': translations['Admin with entered email is already exists'], 'success':False})
                    #return render(request, 'super_admin/add_super_admin.html',{'msg': 'Super Admin with this email is already exists', 'success':False})
            else: # for update case
                super_admin_id = int (admin_id)
                is_active = True if (int(request.POST.get('is_active'))) == 1 else False
                existing_user = EliteNovaUser.objects.get(id = super_admin_id)
                if existing_user:
                    existing_user.company_name=company_name
                    existing_user.company_id=company_id
                    existing_user.employee_name=employee_name
                    existing_user.employee_last_name=employee_last_name
                    existing_user.employee_email=employee_email
                    existing_user.email=employee_email
                    existing_user.phone_number=employee_phone
                    # Update password only if a new password is provided
                    if employee_password:
                        existing_user.password = make_password(employee_password)
                        existing_user.plain_password = employee_password

                    # existing_user.password= make_password(employee_password) # hashing the pass
                    # existing_user.plain_password = employee_password
                    # existing_user.username = employee_name
                    existing_user.is_active = is_active
                    try:
                        existing_user.save()
                        return JsonResponse({'msg':translations ['Admin details has been updated'], 'success':True})
                    except IntegrityError as e:
                        translations = get_translation('super admin')
                        return JsonResponse({'msg': translations["Save failed"], 'success':False})
                else:
                    translations = get_translation('super admin')
                    return JsonResponse({'msg': translations["Save failed"], 'success':False})
        else:# if entry type if bulk
            translations = get_translation('admin')
            expected_columns = ["company_name","company_id","employee_name","account_password","employee_last_name","employee_email_address","employee_phone"]
            response = []
            success_ = 0

            user_role = request.POST.get('user_role')
            if 'bulk_upload_file' in request.FILES and request.FILES['bulk_upload_file']!='':
                df = pd.read_csv(request.FILES['bulk_upload_file'])
                df = df.fillna('')
                role = Role.objects.get(name=user_role)
                if len(df) > 0:
                    if set(df.columns) == set(expected_columns):
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):
                            existing_user = EliteNovaUser.objects.filter(employee_email=row_data["employee_email_address"]).count()
                            # existing_user_name = EliteNovaUser.objects.filter(username=row_data["employee_name"]).count()
                            if existing_user > 0:
                                response.append({'msg': f'User with row#{index+1} {row_data["employee_email_address"]} is already exists', 'success':False})
                            else:
                                
                                account_password = row_data['account_password']
                                
                                if account_password=='':
                                    account_password = generate_password()
                                    
                                new_user = EliteNovaUser(
                                        role=role,
                                        company_name=row_data["company_name"],
                                        company_id=row_data["company_id"],
                                        # employee_id=row_data[""],
                                        employee_name=row_data["employee_name"],
                                        employee_last_name=row_data["employee_last_name"],
                                        employee_email=row_data["employee_email_address"],
                                        email=row_data["employee_email_address"],
                                        phone_number=row_data["employee_phone"],
                                        password= make_password(account_password), # hashing the pass
                                        plain_password = account_password,
                                        is_active = True,
                                        is_staff = False,
                                        is_superuser = False,
                                        # username = row_data["employee_name"],
                                )
                                new_user.save()
                                success_+=1
                        return JsonResponse({'msg': translations['Admins has been added successfully'], 'success':1,'track':response,'insert_count':success_})
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only {len(expected_columns)} and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    translations = get_translation('products')
                    return JsonResponse({'msg': translations['Uploaded file must have some data, its seems empty file'], 'success':0})
            else:
                return JsonResponse({'msg': translations['Uploaded file must have some data, its seems empty file'], 'success':0})
            
    else:
        translations = get_translation('super admin')
        entry_type = request.GET.get('entry_type')
        context = {'entry_type':entry_type, 'data':translations,'data_table':get_translation('Reservation'),'login_data':get_translation('log in')
            ,'product_data':get_translation('products'), 'admin_data':get_translation('admin')
        }
        return render(request, 'super_admin/add_admin_by_super_admin.html', context=context)

    

@role_required(allowed_roles=['super admin'])
def viewAllAdmins(request):
    today_date = datetime.now().date()  # Get today's date
    user_id = request.user.id
    users_query_set = EliteNovaUser.objects.filter(Q(role_id=2) , ~Q(id=user_id))
    # users_list_of_dicts = list(users_query_set.values())
    users_list_of_dicts = []

    for user in users_query_set:
        d = {}
        # Assuming `last_visit_date` is the field storing the last visit date
        if user.last_login is not None:
            last_visit_date = user.last_login.date()
            difference_in_days = (today_date - last_visit_date).days
        else:
            difference_in_days = None
        d['id'] = user.id
        d['employee_name'] = user.employee_name
        d['employee_email'] = user.employee_email
        d['company_id'] = user.company_id
        d['company_name'] = user.company_name
        d['phone_number'] = user.phone_number
        d['registered_date'] = user.registered_date
        d['last_login'] = user.last_login
        d['is_active'] = user.is_active
        d['difference_in_days'] = '' if difference_in_days is None else f'{difference_in_days}'
        users_list_of_dicts.append(d)
    # print(users_list_of_dicts)
    
    context = {'data':get_translation('super admin'),'data_table':get_translation('Reservation'),'login_data':get_translation('log in')
            ,'data_products':get_translation('products'), 'admin_data':get_translation('admin'), "admins":users_list_of_dicts
    }
    return render(request, 'super_admin/view_all_admins_by_super_admin.html', context=context)

@role_required(allowed_roles=['super admin'])
def editAdmin(request, admin_id):
    # admin = get_object_or_404(EliteNovaUser, id=admin_id)
    admin = EliteNovaUser.objects.filter(id=admin_id).values().first()
    admin['is_active_bool'] = 1 if admin['is_active'] else 0
    translations = get_translation('super admin')
       
    context = { 'data':translations,'data_table':get_translation('Reservation'),'login_data':get_translation('log in')
            ,'product_data':get_translation('products'), 'admin_data':get_translation('admin'), 'admin': admin
    }
    
    return render(request, 'super_admin/edit_admin.html', context = context)


@role_required(allowed_roles=['super admin'])
def changeRole(request):
    if request.method == "POST":
        user_id = int(request.POST.get('user_id'))
        from_role = request.POST.get('from_role')
        to_role = request.POST.get('to_role')
        existing_user = EliteNovaUser.objects.get(id = user_id)
        if existing_user: # this given user 
            if to_role == "client" and from_role == "admin":
                existing_user.role_id = 3
                try:
                    existing_user.save()
                    return JsonResponse({'msg': f'Role has been updated from {from_role} to {to_role}', 'success':True})
                except IntegrityError as e:
                    return JsonResponse({'msg': f"Update failed: {e}", 'success':False})
            elif to_role == "admin" and from_role == "client":
                existing_user.role_id = 2
                try:
                    existing_user.save()
                    return JsonResponse({'msg': f'Role has been updated from {from_role} to {to_role}', 'success':True})
                except IntegrityError as e:
                    return JsonResponse({'msg': f"Update failed: {e}", 'success':False})
            else:
                return JsonResponse({'msg': f"The user does not found", 'success':False})
        else:
            return JsonResponse({'msg': f"This route only supports POST request", 'success':False})

# For setting up the inventory views 
@role_required(allowed_roles=['super admin'])
def add_collection(request):

    expected_columns = ["collection_name","collection_barcode","description","back","kant","min_order","in_stock","flow","height","width","kant_code","formica","price_group","price_two_sid","price_one_side","image","color_type","thick"]
    
    if request.method=='POST':
        translations = get_translation('products')
        action = request.POST.get('action')
        if action == "insert":
            if 'upload_drawer' in request.FILES and request.FILES['upload_drawer']!='':
                df = pd.read_csv(request.FILES['upload_drawer'])
                if len(df) > 0:
                    if set(df.columns) == set(expected_columns):
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):
                            Collection.objects.create(
                                collection_name = row_data["collection_name"], 
                                collection_barcode = row_data["collection_barcode"],
                                description = row_data["description"],
                                back = row_data["back"], 
                                kant = row_data["kant"],
                                min_order = row_data["min_order"],
                                in_stock = row_data["in_stock"], 
                                flow = row_data["flow"], 
                                height = row_data["height"], 
                                width = row_data["width"], 
                                kant_code = row_data["kant_code"],
                                formica = row_data["formica"],

                                price_group = row_data["price_group"], 
                                price_two_side = row_data["price_two_side"], 
                                price_one_side = row_data["price_one_side"], 
                                color_type = row_data["color_type"],
                                thick = row_data["thick"],
                            )
                            
                        return JsonResponse({'msg': translations['Collection has been added successfully'], 'success':1})
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only twelve and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    return JsonResponse({'msg': translations['Uploaded file must have some data, its seems empty file'], 'success':0})
            
            
            if 'new_bulk_collection_image' in request.FILES:
                uploaded_files = request.FILES.getlist('new_bulk_collection_image')  # Get all uploaded files
                
                if uploaded_files:  # Ensure there are files
                    num_of_valid_uploads = 0
                    for uploaded_file in uploaded_files:
                        # Extract collection_id from the image name (e.g., "123.jpg" -> "123")
                        file_name_without_extension = splitext(uploaded_file.name)[0]
                        
                        # Check if the file name is an integer
                        if file_name_without_extension.isdigit():
                            collection_id = int(file_name_without_extension)  # Convert to integer
            
                            try:
                                # Check if a collection exists with the given collection_id
                                collection_id = int(file_name_without_extension)  # Assuming collection_id is an integer
                                collection = Collection.objects.get(collection_id=collection_id)
                                
                                # Delete the existing image, if any
                                if collection.collection_image:
                                    collection.collection_image.delete(save=False)  # Deletes the old image file but doesn't save the model
                
                                # Save the image to the collection
                                collection.collection_image.save(
                                    f"{collection_id}-{generate_random_string()}{splitext(uploaded_file.name)[1]}",
                                    uploaded_file
                                )
                                collection.save()  # Save any changes to the collection object
                                num_of_valid_uploads+=1
                                
                            except Collection.DoesNotExist:
                                # Log or ignore files that don't match a valid collection_id
                                print(f"No collection found for ID: {file_name_without_extension}")
                            
                            except ValueError:
                                # Handle invalid file names that cannot be converted to an integer
                                print(f"Invalid file name: {uploaded_file.name}. Expected a number as the file name.")

                    return JsonResponse({'msg': f"{num_of_valid_uploads} of {len(uploaded_files)} {"image" if len(uploaded_files) <=1 else "images"} processed successfully.", 'success': 1})
                else:
                    return JsonResponse({'msg': 'Uploaded files list is empty.', 'success': 0})
            
            else:
                new_collection =  Collection(
                    collection_name = request.POST.get('collection_name'),
                    collection_barcode = request.POST.get('collection_barcode'),
                    description = request.POST.get('description'),
                    back = request.POST.get('back'),
                    kant = request.POST.get('kant'),
                    min_order = request.POST.get('min_order'),
                    in_stock = request.POST.get('in_stock'),
                    flow = request.POST.get('flow'),
                    height = request.POST.get('height'),
                    width = request.POST.get('width'),
                    kant_code = request.POST.get('kant_code'),
                    formica = request.POST.get('formica'),
                    
                    price_group = request.POST.get('price_group'),
                    price_two_side = request.POST.get('price_two_side'),
                    price_one_side = request.POST.get('price_one_side'),
                    color_type = request.POST.get('color_type'),
                    thick = request.POST.get('thick'),
                )
                
                try:
                    new_collection.save()

                    # If image in REQUEST exists
                    if request.FILES.get('new_collection_image'):
                        uploaded_file = request.FILES.get('new_collection_image')
                        new_collection.collection_image.save(f"{new_collection.collection_id}-{generate_random_string()}{splitext(uploaded_file.name)[1]}", uploaded_file)
                    
                    return JsonResponse({'msg': translations['Collection has been added successfully'] , 'success':1})
                except Exception as e:
                    return JsonResponse({'msg':translations['Error in adding Collection'], 'success':0})
        elif action == "delete":
            collection_id = int(request.POST.get('collection_id'))
            obj_to_delete = get_object_or_404(Collection, collection_id=collection_id)
            if obj_to_delete.delete():
                return JsonResponse({"success":1, "msg":translations["Record has been deleted successfullly"]}, safe=False)
            else:
                return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)
        elif action == "edit":        
            collection_id = int(request.POST.get('collection_id'))
            existing_obj = Collection.objects.get(collection_id = collection_id)
            print('the existing obj - ', existing_obj, collection_id, request.POST.get('kant_code'), request.FILES.get('edit_collection_image'))
            if existing_obj: #
                try:
                    existing_obj.collection_name = request.POST.get('collection_name')
                    existing_obj.collection_barcode = request.POST.get('collection_barcode')
                    existing_obj.description = request.POST.get('description')
                    existing_obj.back = request.POST.get('back')
                    existing_obj.kant = request.POST.get('kant')
                    existing_obj.min_order = request.POST.get('min_order')
                    existing_obj.in_stock = request.POST.get('in_stock')
                    existing_obj.flow = request.POST.get('flow')
                    existing_obj.height = int(request.POST.get('height'))
                    existing_obj.width = int(request.POST.get('width'))
                    existing_obj.kant_code = request.POST.get('kant_code')
                    existing_obj.formica = request.POST.get('formica')
                    
                    existing_obj.price_group = request.POST.get('price_group')
                    existing_obj.price_two_side = request.POST.get('price_two_side')
                    existing_obj.price_one_side = request.POST.get('price_one_side')
                    # existing_obj.image = request.POST.get('image')
                    existing_obj.color_type = request.POST.get('color_type')
                    existing_obj.thick = request.POST.get('thick')

                    existing_obj.save()

                    # If image in REQUEST exists
                    if request.FILES.get('edit_collection_image'):
                        uploaded_file = request.FILES.get('edit_collection_image')

                        # Delete the existing image, if any
                        if existing_obj.collection_image:
                            existing_obj.collection_image.delete(save=False)  # Deletes the old image file but doesn't save the model
                
                        existing_obj.collection_image.save(f"{existing_obj.collection_id}-{generate_random_string()}{splitext(uploaded_file.name)[1]}", uploaded_file)
                    
                    print('the EDIT -  ',request.POST.get('kant_code'), existing_obj.collection_image, existing_obj.kant_code)
                    return JsonResponse({'msg': translations['Collection has been updated successfully'], 'success':1})
                except IntegrityError as e:
                    return JsonResponse({'msg': translations["Update failed"], 'success':0})
            else:
                return JsonResponse({'msg': translations["The record does not found"], 'success':0})

    else:
        headers = ",".join(expected_columns)
        translations = get_translation('products')
        context = {'data':translations, 'given_file_headers':headers, 'data_table':get_translation('Reservation')}
        return render(request, 'super_admin/collection_page.html', context=context)

@role_required(allowed_roles=['super admin'])
def all_collection(request):
    translations = get_translation('products')
    all_collection_cls = Collection.objects.all()

    data = [{"collection_id": collection.collection_id,
            "collection_name": collection.collection_name,
            "collection_barcode": collection.collection_barcode,
            "description": collection.description,
            "back": collection.back,
            "kant": collection.kant,
            "min_order": collection.min_order,
            "in_stock":  translations['yes'] if collection.in_stock == 1 else translations['no'],
            "in_stock_bool": collection.in_stock,
            "flow": translations['yes'] if collection.flow == 1 else translations['no'],
            "flow_bool":collection.flow,
            "height": collection.height,
            "width": collection.width,
            "kant_code": collection.kant_code,
            
            "price_group": collection.price_group,
            "price_two_side": collection.price_two_side,
            "price_one_side": collection.price_one_side,
            "image": collection.collection_image,
            "color_type": collection.color_type,
            "thick": collection.thick,
            "image": collection.collection_image.url if collection.collection_image else "",

            "formica": translations['yes'] if collection.formica == 1 else translations['no'],
            "formica_bool":collection.formica
        } for collection in all_collection_cls]
    return JsonResponse({'data': data}, safe=False)
    

@role_required(allowed_roles=['super admin'])
def add_knobs(request):
    if request.method == "POST":
        translations = get_translation('products')
        action = request.POST.get('action')
        if action == "insert":
            if 'upload_drawer' in request.FILES and request.FILES['upload_drawer']!='':
                df = pd.read_csv(request.FILES['upload_drawer'])
                if len(df) > 0:
                    expected_columns = ["knob_family","knob_model","two_parts_knob","color","knob_size","button_height"]
                    if set(df.columns) == set(expected_columns):
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):
                            Knob.objects.create(
                                knob_family = row_data['knob_family'],
                                knob_model = row_data['knob_model'],
                                two_parts_knob = row_data['two_parts_knob'],
                                color = row_data['color'],
                                knob_size = row_data['knob_size'],
                                button_height = row_data['button_height'],
                            )
                            # if index == len(df)-1:
                            #     return JsonResponse({'msg': 'Knob Details has been added successfully', 'success':1})
                        return JsonResponse({'msg': translations['Knob Details has been added successfully'], 'success':1})
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only six and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    return JsonResponse({'msg':translations['Uploaded file must have some data, its seems empty file'], 'success':0})
            else: ## for single insertion
                knob_family = request.POST.get('knob_family')
                knob_model = request.POST.get('knob_model')
                two_partsknob = request.POST.get('two_partsknob')
                knob_color = request.POST.get('knob_color')
                knob_size = request.POST.get('knob_size')
                button_height = request.POST.get('button_height')
                new_knob = Knob(
                    knob_family = knob_family,
                    knob_model = knob_model,
                    two_parts_knob = two_partsknob,
                    color = knob_color,
                    knob_size = knob_size,
                    button_height = button_height,
                )
                try:
                    new_knob.save()
                    return JsonResponse({'msg': translations['Knob Details has been added successfully'], 'success':1})
                except Exception as e:
                    return JsonResponse({'msg': translations['Error in adding knob'], 'success':0})
        elif action == "edit":
            knob_id = int(request.POST.get('knob_id'))
            existing_obj = Knob.objects.get(knob_id = knob_id)
            if existing_obj: #
                existing_obj.knob_family = request.POST.get('knob_family')
                existing_obj.knob_model = request.POST.get('knob_model')
                existing_obj.two_parts_knob = request.POST.get('two_partsknob')
                existing_obj.color = request.POST.get('knob_color')
                existing_obj.knob_size = request.POST.get('knob_size')
                existing_obj.button_height = request.POST.get('button_height')
                try:
                    existing_obj.save()
                    return JsonResponse({'msg': translations['Knob Details has been updated successfully'], 'success':1})
                except IntegrityError as e:
                    return JsonResponse({'msg':translations["Update failed"], 'success':0})
            else:
                return JsonResponse({'msg': translations["The record does not found"], 'success':0})
        elif action == "delete":
            knob_id = int(request.POST.get('knob_id'))
            obj_to_delete = get_object_or_404(Knob, knob_id=knob_id)
            if obj_to_delete.delete():
                return JsonResponse({"success":1, "msg":translations["Record has been deleted successfullly"]}, safe=False)
            else:
                return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)

    else:
        translations = get_translation('products')
        context = {'data':translations, 'data_table':get_translation('Reservation')}
        return render(request, 'super_admin/add_knobs.html', context = context)

@role_required(allowed_roles=['super admin'])
def all_knobs(request):
    translations = get_translation('products')
    all_knob_cls = Knob.objects.all()
    data = [{'knob_id': knob.knob_id, 'knob_family': knob.knob_family, 'knob_model': knob.knob_model, 'two_parts_knob': translations['yes'] if knob.two_parts_knob == 1 else translations['no'], 'color': translations['yes'] if knob.color == 1 else translations['no'], 'knob_size': knob.knob_size, 'button_height': knob.button_height} for knob in all_knob_cls]
    return JsonResponse({'data': data}, safe=False)

@role_required(allowed_roles=['super admin'])
def add_knob_color(request):
    if request.method == "POST":
        translations = get_translation('products')
        action = request.POST.get('action')
        if action == "insert":
            if 'upload_drawer' in request.FILES and request.FILES['upload_drawer']!='':
                df = pd.read_csv(request.FILES['upload_drawer'])
                # print("sss",df)
                if len(df) > 0:
                    expected_columns = ["color_knob_barcode", "description","color"]
                    if set(df.columns) == set(expected_columns):
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):
                            
                            ColorKnob.objects.create(
                                colorknob_barcode=row_data['color_knob_barcode'],
                                colorknob_description=row_data['description'],
                                colorknob_color =  row_data['color']
                            )
                            if index == len(df):
                                return JsonResponse({'msg': translations['Color Knob has been added successfully'], 'success':1})
                        
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only two and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    return JsonResponse({'msg': translations['Uploaded file must have some data, its seems empty file'], 'success':0})
            else: # for single insertion
                colorknob_barcode = request.POST.get('color_knob_barcode')
                colorknob_description = request.POST.get('description')
                color = request.POST.get('color')
                if colorknob_barcode!='' and colorknob_description!='':
                    new_color_knob = ColorKnob(colorknob_barcode=colorknob_barcode,colorknob_color=color,colorknob_description=colorknob_description)
                    try:
                        new_color_knob.save()
                        return JsonResponse({'msg': translations['Color Knob has been added successfully'], 'success':1})
                    except Exception as e:
                        return JsonResponse({'msg': translations['Error in adding Color Knob'], 'success':0})
        elif action == "delete":
            colorknob_id = int(request.POST.get('color_knob_id'))
            obj_to_delete = get_object_or_404(ColorKnob, colorknob_id=colorknob_id)
            if obj_to_delete.delete():
                return JsonResponse({"success":1, "msg":translations["Record has been deleted successfullly"]}, safe=False)
            else:
                return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)
        elif action == "edit":
            color_knob_id = int(request.POST.get('color_knob_id'))
            existing_obj = ColorKnob.objects.get(colorknob_id = color_knob_id)
            if existing_obj: #
                existing_obj.colorknob_barcode = request.POST.get('color_knob_barcode')
                existing_obj.colorknob_description = request.POST.get('description')
                existing_obj.colorknob_color = request.POST.get('color')
                try:
                    existing_obj.save()
                    return JsonResponse({'msg': translations['Record has been deleted successfullly'], 'success':1})
                except IntegrityError as e:
                    return JsonResponse({'msg': translations["Update failed"], 'success':0})
            else:
                return JsonResponse({'msg': translations["The record does not found"], 'success':0})
    else:
        translations = get_translation('products')
        context = {'data':translations, 'data_table':get_translation('Reservation')}
        return render(request, 'super_admin/add_knob_color.html', context = context)

@role_required(allowed_roles=['super admin'])
def all_knob_colors(request):
    translations = get_translation('products')
    all_knob_cls = ColorKnob.objects.all()
    data = [{'colorknob_id': knob.colorknob_id, 'colorknob_barcode': knob.colorknob_barcode, 'colorknob_description': knob.colorknob_description,'colorknob_color':knob.colorknob_color, 'colorknob_color_word':translations['yes'] if knob.colorknob_color==1 else translations['no']} for knob in all_knob_cls]
    return JsonResponse({'data': data}, safe=False)


@role_required(allowed_roles=['super admin'])
def add_drawars(request):
    if request.method == "POST":
        translations = get_translation('products')
        action = request.POST.get('action')
        if action == "insert":
            if 'upload_drawer' in request.FILES and request.FILES['upload_drawer']!='':
                df = pd.read_csv(request.FILES['upload_drawer'])
                if len(df) > 0:
                    expected_columns = ["drawer_type", "drawer_code"]
                    if set(df.columns) == set(expected_columns):
                        
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):
                            Drawer.objects.create(
                                drawer_type=row_data['drawer_type'],
                                drawer_code=row_data['drawer_code']
                            )
                            if index == len(df) - 1:
                                return JsonResponse({'msg': translations['Drawers has been added successfully'], 'success':1})
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only two and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    return JsonResponse({'msg': translations['Uploaded file must have some data, its seems empty file'], 'success':0})
            else: # for single insertion
                drawers_type = request.POST.get('drawers_type')
                drawers_code = request.POST.get('drawers_code')
                if drawers_type!='' and drawers_code!='':
                    new_drawer = Drawer(drawer_type=drawers_type,drawer_code=drawers_code)
                    try:
                        new_drawer.save()
                        return JsonResponse({'msg': translations['Drawers has been added successfully'], 'success':1})
                    except Exception as e:
                        return JsonResponse({'msg':translations['Error in adding drawers'], 'success':0})
        elif action == "delete":
            drawer_id = int(request.POST.get('drawer_id'))
            obj_to_delete = get_object_or_404(Drawer, drawer_id=drawer_id)
            if obj_to_delete.delete():
                return JsonResponse({"success":1, "msg":translations["Record has been deleted successfullly"]}, safe=False)
            else:
                return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)
        elif action == "edit":
            drawer_id = int(request.POST.get('drawer_id'))
            existing_obj = Drawer.objects.get(drawer_id = drawer_id)
            if existing_obj:
                existing_obj.drawer_type = request.POST.get('drawers_type')
                existing_obj.drawer_code = request.POST.get('drawers_code')
                try:
                    existing_obj.save()
                    return JsonResponse({'msg': translations['Record has been updated successfully'], 'success':1})
                except IntegrityError as e:
                    return JsonResponse({'msg':translations["Update failed"], 'success':0})
            else:
                return JsonResponse({'msg': translations["The record does not found"], 'success':0})
    else:
        translations = get_translation('products')
        context = {'data':translations, 'data_table':get_translation('Reservation')}
        return render(request, 'super_admin/add_drawars.html', context = context)

@role_required(allowed_roles=['super admin'])
def all_drawer_data(request):
    
    all_drawers = Drawer.objects.all()
    data = [{'drawer_id': drawer.drawer_id, 'drawer_type': drawer.drawer_type, 'drawer_code': drawer.drawer_code} for drawer in all_drawers]   
    return JsonResponse({'data': data}, safe=False)



# @role_required(allowed_roles=['super admin'])
# def viewSuperAdminInventory(request):
#     return render(request, 'super_admin/view_inventory_super_admin.html')


# def getDraftOrders(request):
#     order_status = 'draft'
# def get_pastorder_id(curent_order_id):
#     obj = RelatedOrders.objects.get(current_order=int(curent_order_id))
#     if obj:
#         return obj
#     else:
#         return ''

def get_all_orders(role_id=None, user_id=None, order_status=None):
    trans = get_translation('Reservation')
    sql_query = """
        SELECT
            o.*,
            r.related_order_id,
            r.past_order_id,
            r.current_order_id,
            r.created_at AS related_created_at,
            r.updated_at AS related_updated_at,
            ot.order_id AS past_order_id, 
            u.company_name,
            u.employee_name,
            u.id,
            TO_CHAR(o.created_at, 'DD/MM/YYYY') AS formatted_created_at,
            TO_CHAR(o.updated_at, 'DD/MM/YYYY') AS formatted_updated_at,
            i.order_item_uploaded_img
        FROM
            public.super_admin_ordertrack o
        LEFT JOIN
            public.super_admin_relatedorders r
        ON
            o.order_track_id = r.current_order_id
        LEFT JOIN
            public.super_admin_ordertrack ot
        ON
            r.past_order_id = ot.order_track_id
        LEFT JOIN
            public.super_admin_elitenovauser  u
        ON
            o.user_id = u.id
        LEFT JOIN
            public.super_admin_orderitems  i
        ON
            o.order_track_id = i.order_track_id
        WHERE 
            1=1
    """
    if role_id:
        sql_query += f" AND u.role_id = {role_id}"
    if user_id:
        sql_query += f" AND u.id = {user_id}"
    if order_status:
        order_status = trans[order_status]
        sql_query += f" AND o.order_status = '{order_status}'"
    
    sql_query += " ORDER BY o.created_at DESC"
    # print(sql_query)
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        rows = cursor.fetchall()
    results = []
    columns = [col[0] for col in cursor.description]
    for row in rows:
        result_dict = dict(zip(columns, row))
        result_dict['order_id'] = str(result_dict['order_id'])
        result_dict['past_order_id'] = str(result_dict['past_order_id']) if result_dict['past_order_id']!=None else ''
        results.append(result_dict)
    
    return results


# for setting up the orders views
@role_required(allowed_roles=['super admin','client','admin'])
def viewSuperAdminOrders(request):
    get_menus_translation(request) # for getting the menus translation in web app
    if request.method == "GET":
        if not request.GET.get('get_data'):
            translations = get_translation('Reservation')
            product_ = get_translation('products')
            company_name = request.user.company_name
            employ_name = request.user.employee_name
            employ_last_name = request.user.employee_last_name
            user_id = ""
            data = {'data': translations,'productData':product_,'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name,'user_id':user_id}
            # print(data)
            if request.GET.get('user_id'):
                user_id = int(request.GET.get('user_id'))
                obj = EliteNovaUser.objects.get(id=user_id)
                da = model_to_dict(obj)
                data = {'data': translations,'productData':product_,'company_name':da['company_name'],'employ_name':da['employee_name'],'employ_last_name':da['employee_last_name'],'user_id':user_id}
            data.update({'view_btn':  "לצפיה בהזמנה" ,'edit_btn':"ערוך הזמנה",'check_btn': "אשר השלמת הזמנה" })
            return render(request, 'super_admin/view_orders_super_admin.html', context=data)
        elif request.GET.get('get_data'):
            data = []
            # if request.GET.get('get_draft_order'):
            #     all_orders_data = OrderTrack.objects.all().order_by('-created_at')
            if not request.GET.get('user_id'):
                if request.user.role_id in [1,2]:
                    # all_orders_data = OrderTrack.objects.all().order_by('-created_at')
                    data = get_all_orders()
                else:
                    # data = get_all_orders(role_id=None, user_id=None, order_status=None)
                    data = get_all_orders(user_id=request.user.id, order_status=None)
                    # user_id = request.user.id
                    # all_orders_data = OrderTrack.objects.filter(user_id=user_id).order_by('-created_at')
                    
            else:
                user_id =  int(request.GET.get('user_id'))
                #all_orders_data = OrderTrack.objects.filter(user_id=user_id).order_by('-created_at')
                data = get_all_orders(user_id=request.user.id, order_status=None)
            
            # data = get_all_orders()
            # print(get_all_orders())
            # related_order_mapper = {}

            # all_orders_data = OrderTrack.objects.all().select_related('user').order_by('-created_at').prefetch_related('related_past_orders', 'related_current_orders')


            # for item in all_orders_data:
            #     dic = model_to_dict (item)
            #     if dic['related_reservation']==True:
            #         print(dic)
                # past_order = ''
                # if RelatedOrders.objects.filter(current_order= item.order_track_id).exists():
                #     related_orders = RelatedOrders.objects.get(current_order= int(item.order_track_id))
                #     related_orders_dict = model_to_dict(related_orders)
                #     past_order = int(related_orders_dict['past_order'])
                #     if OrderTrack.objects.filter(order_track_id = past_order).exists():
                #         query = OrderTrack.objects.get(order_track_id = past_order)
                #         dd = model_to_dict(query)
                        
                #         past_order = dd.get('order_id','')
                # try:
                #     related_orders = RelatedOrders.objects.get(current_order= int(item.order_track_id))  # Get the RelatedOrders instance by primary key
                #     related_orders_dict = model_to_dict(related_orders)
                #     # Access the related OrderTrack instances
                #     # related_past_orders = related_orders.related_past_orders.all()  # Query related past orders
                #     # related_current_orders = related_orders.related_current_orders.all()  # Query related current orders
                #     #print(related_orders_dict)
                #     related_order_mapper[related_orders_dict.get('current_order')] = {'past_order_id':related_orders_dict.get('past_order'),'order_track_id':str(item.order_id)}
                #     # print(related_current_orders)
                #     # Process the related orders as needed
                # except RelatedOrders.DoesNotExist:
                #     # Handle the case where no RelatedOrders object is found
                #     pass
                # print(related_order_mapper)     
                # data.append({
                #     'order_track_id':item.order_track_id,
                #     'order_id':str(item.order_id),
                #     'client_order_name':item.client_order_name,
                #     'client_order_id':item.client_order_id,
                #     'order_status':item.order_status,
                #     'related_reservation':related_order_mapper.get('past_order_id','') if item.related_reservation else 'No',
                #     'product_type':item.product_type,
                #     'order_decision_tracker':item.order_decision_tracker,
                #     'type_of_reservation':item.type_of_reservation,
                #     'order_collection_entries_count':item.order_collection_entries_count,
                #     'order_cards_rows_count':item.order_cards_rows_count,
                #     'created_at': item.created_at,
                #     'updated_at': format_registered_date(item.updated_at),
                #     'role_id':request.user.role_id,
                # })
            return JsonResponse({'data':data},safe=False)
    elif request.method == "POST":
        
        order_id = int(request.POST.get('order_id'))
        object_to_update = OrderTrack.objects.get(order_id=order_id)
        if object_to_update:
            
            translations = get_translation('Reservation')
            object_to_update.order_status = translations['complete']
            # object_to_update.order_status = 'complete'
            object_to_update.save()
            trans = get_translation('Reservation')
            return  JsonResponse({'success':1,'msg':trans['Order status has been changed to completed']})
        else:
            return  JsonResponse({'success':0,'msg':trans['Error in marking order as completed']})



def insertHinge( obj, order_track_instance, unique_identifier):
    try:
        ins_ = HingeOrder.objects.create(
            order_track=order_track_instance,
            hinge_order_provider = obj['hinge_provider'],
            hinge_order_door_opening_side = obj["door_operning_side"],
            hinge_order_dty = obj["dty"], 
            hinge_order_yp = obj["yp"], 
            hinge_order_xp1 = obj["xp1"], 
            hinge_order_xp2 = obj["xp2"], 
            hinge_order_xp3 = obj["xp3"], 
            hinge_order_xp4 = obj["xp4"], 
            hinge_order_xp5 = obj["xp5"], 
            hinge_order_xp6 = obj["xp6"], 
            unique_identifier = unique_identifier
        )
        return {'msg':'HingeOrder is inserted','success':1, 'hinge_order_id':ins_.hinge_order_id}
    except Exception as e:
        return {'msg':f'HingeOrder is not inserted due to {e}','success':0}
    

def insertClaps (obj, order_track_instance, unique_identifier):
    try:
        ins_ = ClapOrder.objects.create(
            order_track = order_track_instance,
            clap_claps_pr = obj["clap_pr"],
            clap_order_lo = obj["lo"],
            clap_order_ro = obj["ro"],
            clap_order_bo = obj["bo"],
            unique_identifier = unique_identifier
        )
        return {'msg':'ClapOrder is inserted','success':1, 'clap_order_id':ins_.clap_order_id}
    except Exception as e:
        return {'msg':f'ClapOrder is not inserted due to {e}','success':0}

def insertDrawar(obj, order_track_instance, unique_identifier):
    try:
        ins_ = DrawarOrder.objects.create(
            order_track = order_track_instance,
            drawar_order_type = obj["drawers_type"],
            drawar_order_code = obj["drawers_code"],
            drawar_order_lo = obj["lo"],
            drawar_order_ro = obj["ro"],
            drawar_order_bo = obj["bo"],
            unique_identifier = unique_identifier
        )
        return {'msg':'DrawarOrder is inserted','success':1, 'drawar_order_id':ins_.drawar_order_id}
    except Exception as e:
        return {'msg':f'DrawarOrder is not inserted due to {e}','success':0}

def preprocess_cards(cards): 
    card_list={}
    for index, row in enumerate (cards):
        key = list(row.keys())[0]
        item_key = f"_{key.split('_')[-1]}"
        row_  = key.replace(item_key,"")           
        if row_ in card_list:
            card_list[row_] = {**row, **card_list[row_]}
        else:
            card_list[row_] = row
    return card_list

def get_value_by_index(knob_model_list, index):
    if 0 <= index < len(knob_model_list):
        return knob_model_list[index]
    else:
        return ''  # or any default value you prefer
def find_value_by_key(dict_list, search_key):
    """
    Searches for the given key in a list of dictionaries and returns the corresponding value.
    
    Parameters:
    dict_list (list): List of dictionaries to search.
    search_key (str): The key to search for in the dictionaries.

    Returns:
    str: The value corresponding to the search_key, or 'Key not found' if the key is not present in any dictionary.
    """
    for dictionary in dict_list:
        if search_key in dictionary:
            return dictionary[search_key]
    return ''


def search_by_first_key(list_of_dicts, key_to_find):
    for dictionary in list_of_dicts:
        first_key = next(iter(dictionary))
        if first_key == key_to_find:
            return dictionary
    return None  # Return None if the key is not found in any dictionary


@role_required(allowed_roles=['super admin','admin','client'])
def CreateDoorOrder(request):
    # order_id = str(random.randint(1,10**3)+ time.time() + random.randint(1,10**5)).replace(".","")
    order_id = str(datetime.now().year % 100) +  str(random.randint(10000,99999))
    #order_id = str(random.randint(1,10**3)+ time.time() + random.randint(1,10**5)).replace(".","")

    if request.method == "POST":
        
        action = request.POST.get('action')
        step = request.POST.get('step')
        
        if action == "insert":
            if step == "step_1":
                translations = get_translation('Reservation')
                client_order_name = request.POST.get('client_order_name') 
                client_order_id = request.POST.get('client_order_id')
                if len(client_order_id)!=0:
                    tran = get_translation('create new order')
                    if OrderTrack.objects.filter(client_order_id=client_order_id).exists():
                        return JsonResponse({'success':0,'msg':tran['the record against the order id is already exists form']})
                
                order_id = int(request.POST.get('order_id'))
                request_status_step1 = request.POST.get('request_status_step1')
                product_type = request.POST.get('product_type')
                request_status_step1_user_id = int(request.POST.get('request_status_step1_user_id'))
                user_instance = get_user_model().objects.get(pk=request_status_step1_user_id)
                have_past_order = int(request.POST.get('have_past_order'))
                try:
                    OrderTrack_obj = OrderTrack(
                        order_id = order_id,
                        client_order_name = client_order_name,
                        client_order_id = client_order_id,
                        order_status = translations[request_status_step1],
                        product_type = product_type,
                        type_of_reservation = translations['new'],
                        user = user_instance,
                        
                    )
                    OrderTrack_obj.save()
                    if have_past_order == 1:
                        past_order_id = int(request.POST.get('past_order_id'))

                        # newly_inserted_order_id = OrderTrack_obj.order_track_id
                        new_order_instance = OrderTrack.objects.get(order_id=order_id)
                        past_order_obj = OrderTrack.objects.get(order_id = past_order_id)
                        # Create RelatedOrders instance using the created OrderTrack object
                        related_order = RelatedOrders.objects.create(
                            past_order=past_order_obj,
                            current_order=new_order_instance
                        )
                        past_order_obj.related_reservation = True 
                        new_order_instance.related_reservation = True
                        new_order_instance.type_of_reservation = translations['Continued order']
                        new_order_instance.save()
                        past_order_obj.save()
                        print("related_order is created")
                    
                    return JsonResponse({'success':1,'msg':'The order track has been saved to databases'})
                except Exception as e:
                    return JsonResponse({'msg':f'Error in insertion -> {e}', 'success':0})
            elif step == "step_insert": # its fine
                client_order_name = request.POST.get('client_order_name') 
                translations = get_translation('create new order')
                decision = request.POST.get('decision')
                order_id = int(request.POST.get('order_id'))
                client_order_id = order_id
                order_track_instance = OrderTrack.objects.get(order_id=order_id)
                final_response = {}
                product_type = request.POST.get('product_type')
                uploaded_files = request.FILES.getlist('upload_file[]',[])
                upload_file_tracker = request.POST.getlist('upload_file_tracker[]',[]) # for tracking the uploaded files 

                collection_barcode_list = request.POST.getlist('collection_barcode[]', [])
                texture_list = request.POST.getlist('texture[]', [])



                knob_family =  request.POST.getlist('knob_family[]', [])
                knob_color =   request.POST.getlist('knob_color[]', [])
                
                




                order_items_to_delete = OrderItems.objects.filter(order_track=order_track_instance)
                order_items_to_delete.delete()
                
                if product_type == translations['door']:
                    knobs_tracker = json.loads(request.POST.get("knobs_tracker"))
                    print("knob_family=",knob_family)
                    print("knobs_tracker=",knobs_tracker)
                    
                    # knob_family,knob_color = update_knob_lists(knobs_tracker, knob_family, knob_color)
                    keep_flow_tracker = json.loads(request.POST.get("keep_flow_tracker"))
                    for index, upload_file_tracker_iter in enumerate([no_image for no_image in upload_file_tracker if no_image=='0']):
                        keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[index])
                        result = search_by_first_key(knobs_tracker, collection_barcode_list[index])

                        order_items_instance = OrderItems.objects.create(
                                order_item_collection_barcode = collection_barcode_list[index],
                                order_item_collection = '', 
                                order_item_keepflow = keep_flow_val,
                                order_item_texture = get_value_by_index(texture_list, index),
                                order_item_knobfamily = result['knob_family'],
                                order_item_knobcolor = result['knob_color'],
                                order_track=order_track_instance,
                        )
                        print("order_track_id=",order_items_instance.order_track_id)
                    for index, upload_file_tracker_iter in enumerate([have_image for have_image in upload_file_tracker if have_image=='1']): 
                        keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[index])
                        result = search_by_first_key(knobs_tracker, collection_barcode_list[index])
                        
                        print(index,"I am with image")
                        order_items_instance = OrderItems.objects.create(
                                order_item_collection_barcode = collection_barcode_list[index],
                                order_item_collection= '', 
                                order_item_keepflow= keep_flow_val,
                                order_item_texture=get_value_by_index(texture_list, index),
                                order_item_knobfamily = result['knob_family'],
                                order_item_knobcolor = result['knob_color'],
                                order_track=order_track_instance,
                        )
                        uploaded_file = uploaded_files[index] 
                        #print(uploaded_file)
                        random_str = f"{client_order_id}_{index}"  # Remove last 3 digits for milliseconds
                        random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                        order_items_instance.order_item_uploaded_img.save(random_filename, uploaded_file)

                elif product_type in [translations['plates'], translations['formica']]:
                    # print("product_type=",product_type)
                    #for index, collection_barcode in enumerate(collection_barcode_list):
                    order_items_instance = OrderItems.objects.create(
                            order_item_collection_barcode = collection_barcode_list[0],
                            order_item_collection= '', 
                            order_item_keepflow= '',
                            order_item_texture='',
                            order_item_knobfamily='',
                            order_item_knobcolor='',
                            order_track=order_track_instance,
                    )
                    print("Inserted the order items")
                
                
                
                counter_list = []
                cards = request.POST.get('cards')
                width_list = request.POST.getlist('width[]', [])
                
                unique_identifier_list = ['' for _ in range(len(width_list))]
                
                height_list = request.POST.getlist('height[]', [])

                quantity_list = request.POST.getlist('quantity[]', [])
                knob_model_list = request.POST.getlist('knob_model[]', [])

                knob_model_list = ['' if x == translations['without knob'] else x for x in knob_model_list]
                print("knob_model_list=",knob_model_list)
                #exit()
                knob_position_list = request.POST.getlist('knob_position[]', [])
                collection_barcode_td_list = request.POST.getlist('collection_barcode_td[]',['' for _ in range(len(width_list))])
                # print("collection_barcode_td_list", collection_barcode_td_list)
                # deleting from cards
                card_delete_obj = Cards.objects.filter(order_track= order_track_instance)
                card_delete_obj.delete()
                print("Line#947, Cards delete removed")
                #Delete end here
                # delete the entries in hinge
                hinge_obj_delete = HingeOrder.objects.filter(order_track = order_track_instance)
                hinge_obj_delete.delete()
                print("Removing HingeOrder Entries")
                #end
                # delete the entries in claps
                clap_obj_delete = ClapOrder.objects.filter(order_track = order_track_instance)
                clap_obj_delete.delete()
                print("Removing ClapOrder Entries at Line 974")
                #end
                # delete the entries in drawer
                drawer_obj_delete = DrawarOrder.objects.filter(order_track = order_track_instance)
                drawer_obj_delete.delete()
                print("Removing DrawarOrder Entries at Line 982")
                #end
                counter_list = []
                if cards!='[]':
                    cards = json.loads(cards)
                    cards_re = preprocess_cards(cards)
                    unique_identifier_list = [f"{random.choice(string.ascii_uppercase)}_{order_id}" for _ in range(len(width_list))]
                    for index, width in enumerate([w for w in width_list if w!='']):
                        have_drawer = False
                        have_hinge = False
                        have_claps = False
                        notes = ''
                        
                        card_index = index+1
                        card_key = f"row_{card_index}"
                        if card_key in cards_re:
                            counter_list.append(index)
                            obj = cards_re[card_key]
                            next_keys = [f"{card_key}_drawer",f"{card_key}_hinge",f"{card_key}_claps",f"{card_key}_notes"]
                            for kk in next_keys:
                                if kk in obj:
                                    subform_type = obj[kk].get('subform_type')
                                    if "drawer" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertDrawar(obj[kk], order_track_instance , unique_identifier_list[index])
                                        have_drawer = True
                                    
                                    if "hinge" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertHinge(obj[kk], order_track_instance, unique_identifier_list[index])
                                        have_hinge = True
                                    
                                    if "claps" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertClaps(obj[kk], order_track_instance, unique_identifier_list[index])
                                        have_claps = True
                                    
                                    if "notes" in kk:
                                        notes = obj[kk]['notes']

                        if decision == "yes":
                            knob_id = ''
                            knob_position_id=''
                            if knob_model_list[index]!='':
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id = knob_dic['knob_id']
                                knob_position_id = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = unique_identifier_list[index],
                                knob = knob_id,
                                collection_barcode_id = collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id,
                                card_notes = notes, 
                            )
                        else:
                            knob_id = ''
                            knob_position_id = ''
                            result = search_by_first_key(knobs_tracker, collection_barcode_list[0])
                            if result[collection_barcode_list[0]] == 'yes' and knob_model_list[index]!='':
                                knob_family = result['knob_family']
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id = knob_dic['knob_id']
                                knob_position_id = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = unique_identifier_list[index],
                                knob = knob_id,
                                collection_barcode_id = '',
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id,
                                card_notes = notes, 
                            )

                        

                else:
                    have_drawer = False
                    have_hinge = False
                    have_claps = False
                    for index, width in enumerate([w for w in width_list if w!='']):
                        if decision == "yes":
                            knob_id__ = ""
                            knob_position_id = ''
                            if Knob.objects.filter(knob_model=knob_model_list[index]).count() > 0:
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id__ = knob_dic['knob_id']
                                knob_position_id = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id__,
                                collection_barcode_id = collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id,
                                card_notes = '',
                            )
                        else:
                            knob_id = ''
                            knob_position_id = ''
                            result = search_by_first_key(knobs_tracker, collection_barcode_list[0])
                            if result[collection_barcode_list[0]] == 'yes' and knob_model_list[index]!='':
                                knob_family = result['knob_family']

                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id = knob_dic['knob_id']
                                knob_position_id = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id,
                                collection_barcode_id = '' if decision=="no" else collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id =knob_position_id,
                                card_notes = '',
                            )
                        
                        print(f"All good -> {index}")
                        # except Exception as e:
                        #     print(f"Exception line 812 -> {e}")
                # end this for loop
                translations = get_translation('Reservation')
                counter_list = set(counter_list)
                # print("counter_list=",len(counter_list))
                order_track_instance.order_cards_rows_count = len(counter_list)
                order_track_instance.order_collection_entries_count = len(collection_barcode_list)
                order_track_instance.order_decision_tracker = decision
                order_track_instance.type_of_reservation = translations['new']
                # translations = get_translation('Reservation')
                order_track_instance.order_status = translations['sent']
                if client_order_name:
                    order_track_instance.client_order_name = client_order_name
                order_track_instance.save()
                return JsonResponse ({'success':1,'msg':'All inserted', 'track':final_response})
            elif step == "step_draft": # this will used for tracking the order without telling the user
                order_item_ids = [] # to save them to html
                translations = get_translation('create new order')
                
                # from_draft_to_sent_form = request.POST.get('from_draft_to_sent_form')
                decision = request.POST.get('decision')
                #client_order_id = request.POST.get('client_order_id')
                order_id = int(request.POST.get('order_id'))
                client_order_id = order_id
                order_track_instance = OrderTrack.objects.get(order_id=order_id)
                client_order_name = request.POST.get('client_order_name')
                if client_order_name:
                    order_track_instance.client_order_name = client_order_name
                final_response = {}
                product_type = request.POST.get('product_type')
                uploaded_files = request.FILES.getlist('upload_file[]',[])
                upload_file_tracker = request.POST.getlist('upload_file_tracker[]') # for tracking the uploaded files 
                collection_barcode_list = request.POST.getlist('collection_barcode[]', [])
                # print(collection_barcode_list)
                
                collection_list = request.POST.getlist('collection[]', [])
                texture_list = request.POST.getlist('texture[]', [])
                knob_family =  request.POST.getlist('knob_family[]', [])
                knob_color =   request.POST.getlist('knob_color[]', [])
                print("knob_family=",knob_family)
                
                print("knob_color=",knob_color)
                
                order_items_to_delete = OrderItems.objects.filter(order_track=order_track_instance)
                order_items_to_delete.delete()
                print("Line at 908 Clearning OrderItems table")
                # end here
                if product_type == translations['door']:
                    knobs_tracker = json.loads(request.POST.get("knobs_tracker"))
                    print("knobs_tracker=",knobs_tracker)
                    # exit()
                    keep_flow = request.POST.getlist('keepflow[]', [])
                    keep_flow_tracker = json.loads(request.POST.get("keep_flow_tracker"))
               
                    
                    for index, upload_file_tracker_iter in enumerate(upload_file_tracker):
                        # print(index, collection_barcode_list[index])
                        keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[index])
                        result = search_by_first_key(knobs_tracker, collection_barcode_list[index])
                        if result:
                            order_items_instance = OrderItems.objects.create(
                                    order_item_collection_barcode = collection_barcode_list[index],
                                    order_item_collection= '', 
                                    order_item_keepflow= keep_flow_val,
                                    order_item_texture=texture_list[index],
                                    order_item_knobfamily=result['knob_family'],
                                    order_item_knobcolor= result['knob_color'],
                                    order_track=order_track_instance,
                            )
                            order_item_ids.append(order_items_instance.order_item_id)
                            if int(upload_file_tracker_iter) == 1: #if image is uploaded
                                uploaded_file = uploaded_files[index]
                                random_str = f"{client_order_id}_{index}"  # Remove last 3 digits for milliseconds
                                random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                                order_items_instance.order_item_uploaded_img.save(random_filename, uploaded_file)
                        
                        # except:
                        #         print("Ignore index",index)
                    # else:
                    #     print(f"I am {from_draft_to_sent_form} case")

                elif product_type in [translations['plates'], translations['formica']]:
                    # for index, collection_barcode in enumerate(collection_barcode_list):
                    order_items_instance = OrderItems.objects.create(
                            order_item_collection_barcode = collection_barcode_list[0],
                            order_item_collection= '', 
                            order_item_keepflow= '',
                            order_item_texture='',
                            order_item_knobfamily='',
                            order_item_knobcolor='',
                            order_track=order_track_instance,
                    )
                
                cards = request.POST.get('cards')
                # print(cards)
                width_list = request.POST.getlist('width[]', [])
                # print("width_list=",len(width_list))
                unique_identifier_list = ['' for _ in range(len(width_list))]
                
                height_list = request.POST.getlist('height[]', [])
                quantity_list = request.POST.getlist('quantity[]', [])
                knob_model_list = request.POST.getlist('knob_model[]', [])
                knob_model_list = ['' if x == translations['without knob'] else x for x in knob_model_list]
                print("knob_model_list",knob_model_list,"*************************")
                #break
                knob_position_list = request.POST.getlist('knob_position[]', ['' for _ in range(len(width_list))])
                
                collection_barcode_td_list = request.POST.getlist('collection_barcode_td[]',['' for _ in range(len(width_list))])
                print("collection_barcode_td_list=",collection_barcode_td_list)
                print("knob_position_list=",knob_position_list)
                
                # # deleting from cards
                card_delete_obj = Cards.objects.filter(order_track= order_track_instance)
                card_delete_obj.delete()
                print("Line#1557, Cards delete removed")
                #Delete end here
                # delete the entries in hinge
                hinge_obj_delete = HingeOrder.objects.filter(order_track = order_track_instance)
                hinge_obj_delete.delete()
                print("Removing HingeOrder Entries")
                #end
                # delete the entries in claps
                clap_obj_delete = ClapOrder.objects.filter(order_track = order_track_instance)
                clap_obj_delete.delete()
                print("Removing ClapOrder Entries at Line 974")
                #end
                # delete the entries in drawer
                drawer_obj_delete = DrawarOrder.objects.filter(order_track = order_track_instance)
                drawer_obj_delete.delete()
                print("Removing DrawarOrder Entries at Line 982")
                
                #end
                counter_list = []
                row_count_in_lower_table = 0
                if cards!='[]':
                    unique_identifier_list = [f"{random.choice(string.ascii_uppercase)}_{order_id}" for _ in range(len(width_list))]
                    cards = json.loads(cards)
                    cards_re = preprocess_cards(cards)
                    # print("cards",cards)
                    # print("cards_re",cards_re)
                    # exit()
                    
                    for index, width in enumerate([w for w in width_list if w!='']):
                        
                        have_drawer = False
                        have_hinge = False
                        have_claps = False
                        notes = ''
                        card_index = index+1
                        card_key = f"row_{card_index}"
                        print("card_key=",card_key)
                        if card_key in cards_re:
                            obj = cards_re[card_key]
                            next_keys = [f"{card_key}_drawer",f"{card_key}_hinge",f"{card_key}_claps",f"{card_key}_notes"]
                            for kk in next_keys:
                                if kk in obj:
                                    subform_type = obj[kk].get('subform_type')
                                    if "drawer" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertDrawar(obj[kk], order_track_instance , unique_identifier_list[index])
                                        have_drawer = True
                                    
                                    if "hinge" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertHinge(obj[kk], order_track_instance, unique_identifier_list[index])
                                        have_hinge = True
                                    
                                    if "claps" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertClaps(obj[kk], order_track_instance, unique_identifier_list[index])
                                        have_claps = True
                                    
                                    if "notes" in kk:
                                        notes = obj[kk]['notes']
                        # print("notes=",notes)
                        if decision == "yes":
                            print("I am in YES decision")
                            knob_id__ = ""
                            knob_position_id= ''
                            if Knob.objects.filter(knob_model=knob_model_list[index]).count() > 0:
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id__ = knob_dic['knob_id']
                                knob_position_id = knob_position_list[index]
                                print(f"{index}: knob_position_id=",knob_position_id)
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = unique_identifier_list[index],
                                knob = knob_id__,
                                collection_barcode_id = '' if decision=="no" else collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id,
                                card_notes = notes, 
                            )
                            row_count_in_lower_table+=1
                        else:
                            knob_id = ''
                            knob_position_id= ''
                            
                            result = search_by_first_key(knobs_tracker, collection_barcode_list[0])
                            if result[collection_barcode_list[0]] == 'yes' and knob_model_list[index]!='':
                                knob_family = result['knob_family']
                                
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id = knob_dic['knob_id']
                                knob_position_id = knob_position_list[index]
                                print("knob_position_id=",knob_position_id)
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id,
                                collection_barcode_id = '' if decision=="no" else collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id,
                                card_notes = notes,
                            )
                            row_count_in_lower_table+=1
                else:
                   
                    have_drawer = False
                    have_hinge = False
                    have_claps = False
                    for index, width in enumerate([w for w in width_list if w!='']):
                        if decision == "yes":
                            knob_id__ = ""
                            knob_position_id_ = ''
                            if Knob.objects.filter(knob_model=knob_model_list[index]).count() > 0:
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id__ = knob_dic['knob_id']
                                knob_position_id_ = knob_position_list[index]
                                # print(index,knob_position_id_)
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id__,
                                collection_barcode_id = collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id_,
                                card_notes = '',
                            )
                            row_count_in_lower_table+=1
                        else:
                            knob_id = ''
                            knob_position_id_ = ''
                            result = search_by_first_key(knobs_tracker, collection_barcode_list[0])
                            if result[collection_barcode_list[0]] == 'yes' and knob_model_list[index]!='':
                                knob_family = result['knob_family']
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id = knob_dic['knob_id']
                                knob_position_id_ = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id,
                                collection_barcode_id = '',
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id_,
                                card_notes = '',
                            )
                            row_count_in_lower_table+=1
                        print(f"All good -> {index}")
                        
                translations = get_translation('Reservation')
                
                order_track_instance.order_cards_rows_count = row_count_in_lower_table
                order_track_instance.order_collection_entries_count = len(collection_barcode_list)
                order_track_instance.order_decision_tracker = decision
                order_track_instance.type_of_reservation = translations['new']
                order_track_instance.order_status = translations['draft']
                order_track_instance.save()
                hidden_fields = ["<input type='hidden' value='{0}' name='order_item_ids[]'>".format(i) for i in order_item_ids]
                response = {'success':1,'msg':'All data added to draft', 'save_datetime':datetime.now(), 'hidden_ids':''.join(hidden_fields)}
                return JsonResponse (response)
            elif step == "collection_image_updation":
                if request.FILES.get('uploaded_file'):
                    client_order_id = int(request.POST.get('order_id'))
                    order_item_id = int(request.POST.get('order_item_id'))
                    # index = int(request.POST.get('index')) - 3
                    index = random.randint(1,10)
                    uploaded_file = request.FILES.get('uploaded_file')
                    # order_track_instance = OrderTrack.objects.get(order_id=order_id)
                    order_items_instance = OrderItems.objects.get(order_item_id=order_item_id)
                    random_str = f"{client_order_id}_{index}"  # Remove last 3 digits for milliseconds
                    random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                    order_items_instance.order_item_uploaded_img.save(random_filename, uploaded_file)
                    return JsonResponse({"msg":"image updated successfully","success":1,"image_url": order_items_instance.order_item_uploaded_img.url})
            elif step == "step_draft_to_complete":
                knobs_tracker = json.loads(request.POST.get("knobs_tracker"))
                keep_flow_tracker = json.loads(request.POST.get("keep_flow_tracker"))
                translations = get_translation('create new order')
                decision = request.POST.get('decision')
                #client_order_id = request.POST.get('client_order_id')
                order_id = int(request.POST.get('order_id'))
                client_order_id = order_id
                order_track_instance = OrderTrack.objects.get(order_id=order_id)
                final_response = {}
                product_type = request.POST.get('product_type')
                uploaded_files = request.FILES.getlist('upload_file[]',[])
                upload_file_tracker = request.POST.getlist('upload_file_tracker[]') # for tracking the uploaded files 
                collection_barcode_list = request.POST.getlist('collection_barcode[]', [])
                # print("collection_barcode_list at line 1707",collection_barcode_list)
                collection_list = request.POST.getlist('collection[]', [])
                texture_list = request.POST.getlist('texture[]', [])
                knob_family =  request.POST.getlist('knob_family[]', [])
                knob_color =   request.POST.getlist('knob_color[]', [])
                #keep_flow = [ request.POST.get('keepflow_3',''), request.POST.get('keepflow_4',''), request.POST.get('keepflow_5','')]
                keep_flow = request.POST.getlist('keepflow[]', [])
                
                # delete data from table before saving them
                order_item_ids = request.POST.getlist('order_item_ids[]',[])
                # knobs_tracker = json.loads(request.POST.get("knobs_tracker"))

                knob_color =   request.POST.getlist('knob_color[]', [])
                # knobs_tracker = json.loads(request.POST.get("knobs_tracker"))
                # knob_family,knob_color = update_knob_lists(knobs_tracker, knob_family, knob_color)
                
                
                # keep_flow_tracker = json.loads(request.POST.get("keep_flow_tracker"))

                if len(order_item_ids) == 0:
                    # delete all items
                    order_items_to_delete = OrderItems.objects.filter(order_track=order_track_instance)
                    order_items_to_delete.delete()
                    #insert new items entered by user
                    #for index, uploaded_file in enumerate(uploaded_files):
                    for index, upload_file_tracker_iter in enumerate(upload_file_tracker):
                        keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[index])
                        result = search_by_first_key(knobs_tracker, collection_barcode_list[index])
                        order_items_instance = OrderItems.objects.create(
                            order_item_collection_barcode = collection_barcode_list[index],
                            order_item_collection= '', 
                            order_item_keepflow= keep_flow_val,
                            order_item_texture=texture_list[index],
                            order_item_knobfamily= result['knob_family'],
                            order_item_knobcolor= result['knob_color'],
                            order_track=order_track_instance,
                        )
                        if int(upload_file_tracker_iter) == 1:
                            uploaded_file = uploaded_files[index]
                            random_str = f"{client_order_id}_{index}"  # Remove last 3 digits for milliseconds
                            random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                            order_items_instance.order_item_uploaded_img.save(random_filename, uploaded_file)
                            print(upload_file_tracker_iter,"Image uploaded")
                else:
                    # if decision == "no":
                    #     order_item_instace = OrderItems.objects.get(order_item_id = int(order_item_ids[0]))
                    #     order_item_instace.order_item_collection_barcode = collection_barcode_list[0]
                    #     order_item_instace.order_item_collection = collection_list[0]
                    #     order_item_instace.order_item_keepflow = keep_flow[0]
                    #     order_item_instace.order_item_texture = texture_list[0]
                    #     order_item_instace.order_item_knobfamily = knob_family[0]
                    #     order_item_instace.order_item_knobcolor = knob_color[0]
                    #     if len(uploaded_files)==0:
                    #         order_item_instace.save()
                    #     else:
                    #         uploaded_file = uploaded_files[0]
                    #         random_str = f"{client_order_id}_0"  # Remove last 3 digits for milliseconds
                    #         random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                    #         order_item_instace.order_item_uploaded_img.save(random_filename, uploaded_file)
                    # else: #when decision is yes or none
                        # print(request.FILES.getlist('upload_file[]'))
                        # for index, uploaded_file in request.FILES.getlist('upload_file[]'):
                        # print(upload_file_tracker)
                        print("order_item_ids at line 1763",order_item_ids)
                        if product_type == translations['door']:
                            # print("order_item_ids",len(order_item_ids))
                            # index__ = 0
                            for i, _collection in enumerate (collection_barcode_list): # update other data but not the image
                                keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[i])
                                result = search_by_first_key(knobs_tracker, collection_barcode_list[i])
                                if 0 <= i < len(order_item_ids):
                                    print("index==>1770",i)
                                    item_id = order_item_ids[i]
                                    order_item_instace = OrderItems.objects.get(order_item_id = int(item_id))
                                    # print(1 if order_item_instace else 0)
                                    order_item_instace.order_item_collection_barcode = collection_barcode_list[i]
                                    order_item_instace.order_item_collection = ''
                                    order_item_instace.order_item_keepflow = keep_flow_val
                                    order_item_instace.order_item_texture = texture_list[i]
                                    order_item_instace.order_item_knobfamily = result['knob_family']
                                    order_item_instace.order_item_knobcolor =  result['knob_color']
                                    upload_file_tracker_iter = upload_file_tracker[i]
                                    if int(upload_file_tracker_iter) == 1:
                                        uploaded_file =  uploaded_files[i]
                                        random_str = f"{client_order_id}_e{random.randint(i,100*3)}"  # Remove last 3 digits for milliseconds
                                        random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                                        order_item_instace.order_item_uploaded_img.save(random_filename, uploaded_file)
                                    else:
                                        print(i,"No image uploaded")
                                    order_item_instace.save()
                                else:
                                    # keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[index])
                                    # keep_flow_val = '' if keep_flow[index] in ['0','on']  else keep_flow[index]
                                    keep_flow_val = find_value_by_key (keep_flow_tracker, collection_barcode_list[i])
                                    result = search_by_first_key(knobs_tracker, collection_barcode_list[i])
                                    n_order_items_instance = OrderItems.objects.create(
                                        order_item_collection_barcode = collection_barcode_list[i],
                                        order_item_collection= '', 
                                        order_item_keepflow= keep_flow_val,
                                        order_item_texture=texture_list[i],
                                        order_item_knobfamily= result['knob_family'],
                                        order_item_knobcolor=result['knob_color'],
                                        order_track=order_track_instance,
                                        )
                                    upload_file_tracker_iter = upload_file_tracker[i]
                                    if int(upload_file_tracker_iter) == 1:
                                        uploaded_file = uploaded_files[i]
                                        random_str = f"{client_order_id}_e{random.randint(i,100*3)}"  # Remove last 3 digits for milliseconds
                                        random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                                        n_order_items_instance.order_item_uploaded_img.save(random_filename, uploaded_file)


                                # except:
                                #     pass
                                # index__+= 1
                                
                                
                            
                            # for index, uploaded_file in enumerate(upload_file_tracker):
                            # for index in range(3 - len(order_item_ids)):
                            #     print("index=",index)
                                # keep_flow_val = '' if keep_flow[index] in ['0','on']  else keep_flow[index]
                                # order_item_instace = OrderItems.objects.get(order_item_id = int(order_item_ids[index]))
                                # if not order_item_instace:
                                #     n_order_items_instance = OrderItems.objects.create(
                                #         order_item_collection_barcode = collection_barcode_list[index],
                                #         order_item_collection= collection_list[index], 
                                #         order_item_keepflow= keep_flow_val,
                                #         order_item_texture=texture_list[index],
                                #         order_item_knobfamily=knob_family[index],
                                #         order_item_knobcolor=knob_color[index],
                                #         order_track=order_track_instance,
                                #     )
                                #     print("Created", index)
                                #     upload_file_tracker_iter = upload_file_tracker[index]
                                #     if int(upload_file_tracker_iter) == 1:
                                #         uploaded_file = uploaded_files[index]
                                #         random_str = f"{client_order_id}_e{random.randint(index,100*3)}"  # Remove last 3 digits for milliseconds
                                #         random_filename = f"{random_str}_{splitext(uploaded_file.name)[1]}"
                                #         n_order_items_instance.order_item_uploaded_img.save(random_filename, uploaded_file)
                        elif product_type in [translations['formica'],translations['plates']]:
                            order_items_to_delete = OrderItems.objects.filter(order_track=order_track_instance)
                            order_items_to_delete.delete()
                            for index, collection_barcode in enumerate(collection_barcode_list):
                                order_items_instance = OrderItems.objects.create(
                                    order_item_collection_barcode = collection_barcode,
                                    order_item_collection = '', 
                                    order_item_keepflow = '',
                                    order_item_texture ='',
                                    order_item_knobfamily ='',
                                    order_item_knobcolor ='',
                                    order_track = order_track_instance,
                                )
                        
                        
                        # print(len(order_item_ids))
                        # pass

                # continue with cards now.
                cards = request.POST.get('cards')
                # print(cards)
                width_list = request.POST.getlist('width[]', [])
                unique_identifier_list = ['' for _ in range(len(width_list))]
                
                height_list = request.POST.getlist('height[]', [])
                quantity_list = request.POST.getlist('quantity[]', [])
                knob_model_list = request.POST.getlist('knob_model[]', [])
                knob_model_list = ['' if x == translations['without knob'] else x for x in knob_model_list]
                knob_position_list = request.POST.getlist('knob_position[]', [])
                
                collection_barcode_td_list = request.POST.getlist('collection_barcode_td[]',['' for _ in range(len(width_list))])
                #deleting from cards
                card_delete_obj = Cards.objects.filter(order_track= order_track_instance)
                card_delete_obj.delete()
                print("Line#947, Cards delete removed")
                #Delete end here
                # delete the entries in hinge
                hinge_obj_delete = HingeOrder.objects.filter(order_track = order_track_instance)
                hinge_obj_delete.delete()
                print("Removing HingeOrder Entries")
                    #end
                # delete the entries in claps
                clap_obj_delete = ClapOrder.objects.filter(order_track = order_track_instance)
                clap_obj_delete.delete()
                print("Removing ClapOrder Entries at Line 974")
                #end
                # delete the entries in drawer
                drawer_obj_delete = DrawarOrder.objects.filter(order_track = order_track_instance)
                drawer_obj_delete.delete()
                print("Removing DrawarOrder Entries at Line 982")
                
                #end
                print("TYPEEEEEEEEEEEEEEEEEEE IS",type(knob_position_list))
                counter_list = []
                
                if cards!='[]':
                    unique_identifier_list = [f"{random.choice(string.ascii_uppercase)}_{order_id}" for _ in range(len(width_list))]
                    cards = json.loads(cards)
                    cards_re = preprocess_cards(cards)
                    
                    
                    for index, width in enumerate([w for w in width_list if w!='']):
                        have_drawer = False
                        have_hinge = False
                        have_claps = False
                        notes = ''
                        card_index = index+1
                        card_key = f"row_{card_index}"
                        if card_key in cards_re:
                            counter_list.append(index)
                            obj = cards_re[card_key]
                            next_keys = [f"{card_key}_drawer",f"{card_key}_hinge",f"{card_key}_claps",f"{card_key}_notes"]
                            for kk in next_keys:
                                if kk in obj:
                                    subform_type = obj[kk].get('subform_type')
                                    if "drawer" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertDrawar(obj[kk], order_track_instance , unique_identifier_list[index])
                                        have_drawer = True
                                    
                                    if "hinge" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertHinge(obj[kk], order_track_instance, unique_identifier_list[index])
                                        have_hinge = True
                                    
                                    if "claps" in kk:
                                        final_response[f"{subform_type}_{index}"] = insertClaps(obj[kk], order_track_instance, unique_identifier_list[index])
                                        have_claps = True
                                    
                                    if "notes" in kk:
                                        notes = obj[kk]['notes']
                            
                        if decision == "yes":
                            knob_id__ = ""
                            knob_position_id= ''
                            if Knob.objects.filter(knob_model=knob_model_list[index]).count() > 0:
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id__ = knob_dic['knob_id']
                                knob_position_id  = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id__,
                                collection_barcode_id = collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id =knob_position_id,
                                card_notes = notes,
                            )
                        else:
                            knob_id = ''
                            knob_position_id= ''
                            result = search_by_first_key(knobs_tracker, collection_barcode_list[0])
                            if result[collection_barcode_list[0]] == 'yes':
                                knob_family = result['knob_family']
                                knob_position_id = knob_position_list[index]
                                if Knob.objects.filter(knob_model=knob_model_list[index]).count() > 0:
                                    knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                    knob_dic = model_to_dict (knob_instance_query)
                                    knob_id = knob_dic['knob_id']
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id,
                                collection_barcode_id = '',
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id =knob_position_id,
                                card_notes = notes,
                            )
                else:
                    
                    have_drawer = False
                    have_hinge = False
                    have_claps = False
                    for index, width in enumerate([w for w in width_list if w!='']):
                        if decision == "yes":
                            knob_id__ = ""
                            knob_position_id_=''
                            if Knob.objects.filter(knob_model=knob_model_list[index]).count() > 0:
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id__ = knob_dic['knob_id']
                                knob_position_id_ = knob_position_list[index]
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id__,
                                collection_barcode_id = collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id = knob_position_id_,
                                card_notes = '',
                            )
                        else:
                            knob_id = ''
                            knob_position_id= ''
                            result = search_by_first_key(knobs_tracker, collection_barcode_list[0])
                            if result[collection_barcode_list[0]] == 'yes' and knob_model_list[index]!='':
                                knob_family = result['knob_family']
                                knob_position_id = knob_position_list[index]
                                knob_instance_query = Knob.objects.get(knob_model=knob_model_list[index])
                                knob_dic = model_to_dict (knob_instance_query)
                                knob_id = knob_dic['knob_id']
                            Cards.objects.create(
                                order_track = order_track_instance,
                                have_drawer = have_drawer,
                                have_clap = have_claps,
                                have_hinge = have_hinge,
                                unique_identifier = '',
                                knob = knob_id,
                                collection_barcode_id = '' if decision=="no" else collection_barcode_td_list[index],
                                card_width = width,
                                card_height = height_list[index],
                                card_quantity = quantity_list[index],
                                knob_position_id =knob_position_id,
                                card_notes = '',
                            )
                    # end this for loop
                # counter_list = set(counter_list)
                translations = get_translation('Reservation')
                order_track_instance.order_cards_rows_count = len(counter_list)
                order_track_instance.order_collection_entries_count = len(collection_barcode_list)
                order_track_instance.order_decision_tracker = decision
                order_track_instance.type_of_reservation = translations['new']
                order_track_instance.order_status = translations['sent']
                order_track_instance.save()
                return JsonResponse ({'success':1,'msg':'All inserted', 'track':final_response})
    else:
        time_zone = settings.TIME_ZONE
        datetime_now=datetime.now(pytz.timezone(time_zone))
        translations = get_translation('create new order')
        Reservation = get_translation('Reservation')

        data = {'data':translations,'data1':Reservation,'order_id':order_id, 'order_date':datetime_now,'order_status':'draft','order_status_show':Reservation['draft'] , 'success':1,'product_type':translations ['door'],'past_order_id':'','have_past_order':0}
        past_order_id = request.GET.get('order_id')
        if past_order_id:
            data = {'data':translations,'data1':Reservation,'order_id':order_id, 'order_date':datetime_now,'order_status':'draft','order_status_show':Reservation['draft'], 'success':1,'product_type':translations ['door'],'past_order_id':past_order_id, 'have_past_order':1}
        return render(request,'super_admin/add_door_order.html', context=data)
    

@role_required(allowed_roles=['super admin','admin','client'])
def delete_draft_order(request):
    if request.method == "POST":
        translations = get_translation('products')
        draft_order_id = int(request.POST.get('draft_order_id'))
        obj_ =  OrderTrack.objects.filter(order_id = draft_order_id).first()
        if obj_:
            order_track_id = obj_.order_track_id
            OrderItems.objects.filter(order_track_id=order_track_id).delete()
            if obj_.delete():
                return JsonResponse({"success":1, "msg":translations["Record has been deleted successfullly"]}, safe=False)
            else:
                return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)
        else:
            return JsonResponse({"success":0, "msg":translations["Error in deleting"]}, safe=False)


@role_required(allowed_roles=['super admin','admin','client'])
def load_draft_orders(request):
    if not request.GET.get('get_draft_order'):
        company_name = request.user.company_name
        employ_name = request.user.employee_name
        employ_last_name = request.user.employee_last_name
        translations = get_translation('Reservation')
        
        products = get_translation('products')
        context = {'data':translations,'products':products,'load_draft_orders':'לחץ לצפיה בהזמנה','delete_text':'מחק טיוטת הזמנה','company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name}
        return render(request, 'super_admin/load_draft_orders.html', context=context)
    else:
        if request.user.role_id in [1,2]:
            #all_orders_data = OrderTrack.objects.filter(order_status='draft').order_by('-updated_at')
            data = get_all_orders(order_status='draft')
        else:
            # user_id = request.user.id
            # all_orders_data = OrderTrack.objects.filter(user_id=user_id, order_status='draft').order_by('-updated_at')
            data = get_all_orders(user_id=request.user.id, order_status='draft')
        
        # data = [{
        #     'order_track_id':item.order_track_id,
        #     'order_id':str(item.order_id),
        #     'client_order_name':item.client_order_name,
        #     'client_order_id':item.client_order_id,
        #     'order_status':item.order_status,
        #     'related_reservation':'Yes' if item.related_reservation else 'No',
        #     'product_type':item.product_type,
        #     'order_decision_tracker':item.order_decision_tracker,
        #     'type_of_reservation':item.type_of_reservation,
        #     'order_collection_entries_count':item.order_collection_entries_count,
        #     'order_cards_rows_count':item.order_cards_rows_count,
        
        #      'created_at': item.created_at,
        #      'updated_at': item.updated_at,
        #      'role_id':request.user.role_id,
        #     } for item in all_orders_data]
        return JsonResponse({'data':data},safe=False)
    #return render(request, 'super_admin/load_draft_orders.html')

@role_required(allowed_roles=['client','admin','super admin'])
def editDraftOrder(request):
    print('IN, EDIT DRAFT ORDER...')
    translations = get_translation('create new order')
    Reservation = get_translation('Reservation')
    
    order_id = int(request.GET.get('order_id'))
    # order_track_obj = OrderTrack.objects.filter(order_id = order_id, order_status='draft').first()
    order_track_obj = OrderTrack.objects.filter(order_id = order_id).first()
    order_item_response_list = []
    order_track_response = {}
    card_item_response_list = []
    all_collection_cls = Collection.objects.all()
    collection_data = [{"collection_id": collection.collection_id,
            "collection_name": collection.collection_name,
            "collection_barcode": collection.collection_barcode,
            "description": collection.description,
            "back": collection.back,
            "kant": collection.kant,
            "min_order": collection.min_order,
            "in_stock":  'Yes' if collection.in_stock == 1 else 'No',
            "in_stock_bool": collection.in_stock,
            "flow": 'Yes' if collection.flow == 1 else 'No',
            "flow_bool":collection.flow,
            "height": collection.height,
            "width": collection.width,
            "kant_code": collection.kant_code,
            "formica": 'Yes' if collection.formica == 1 else 'No',
            "formica_bool":collection.formica,
            "formica_bool2":True if collection.formica == 1 else False
            } for collection in all_collection_cls if collection.in_stock==1]
    all_knob_cls = Knob.objects.all()
    knob_data = [{'knob_id': knob.knob_id, 'knob_family': knob.knob_family, 'knob_model': knob.knob_model, 'two_parts_knob': 'Yes' if knob.two_parts_knob == 1 else 'No', 'knob_color': 'Yes' if knob.color == 1 else 'No', 'knob_size': knob.knob_size, 'button_height': knob.button_height, 'color':knob.color } for knob in all_knob_cls]   
    
    all_knob_cls = ColorKnob.objects.all()
    #knob_color_data = [{'colorknob_id': knob.colorknob_id, 'colorknob_barcode': knob.colorknob_barcode, 'colorknob_description': knob.colorknob_description} for knob in all_knob_cls]
    knob_color_data = [{'colorknob_id': knob.colorknob_id, 'colorknob_barcode': knob.colorknob_barcode, 'colorknob_description': knob.colorknob_description,'colorknob_color':knob.colorknob_color} for knob in all_knob_cls]
    
    #collection_barcode
    #collection_name
    global_dict = {'order_id':order_id, 'order_date':'','order_status':'','product_type':'','collection_data':collection_data,'knob_data':knob_data,'knob_color_data':knob_color_data}
    knobs_tracker = []
    keep_flow_tracker = []
    if order_track_obj:
        order_track_response = model_to_dict(order_track_obj)
        # print(order_track_response)
        order_track_response['created_at'] = order_track_obj.created_at
        global_dict['order_date'] =  order_track_obj.created_at
        global_dict['order_status'] =  order_track_obj.order_status
        global_dict['product_type'] = order_track_obj.product_type
        
        #print(order_track_response)
        user_info_queryset = EliteNovaUser.objects.filter(id = order_track_response['user']).first()
        user_info_obj = model_to_dict(user_info_queryset)
        order_item_object = OrderItems.objects.filter(order_track_id = order_track_response['order_track_id'])
        
        
        order_track_response['company_name'] = user_info_obj['company_name'] 
        order_track_response['employee_name'] = user_info_obj['employee_name']
        order_track_response['employee_last_name'] = user_info_obj['employee_last_name']
        order_track_response['order_decision_tracker_bool'] = True if order_track_response['order_decision_tracker'] == 'yes' else False
        
        global_dict['order_track_response'] = order_track_response
        
        # global_dict['order_item_response_list'] =  [model_to_dict(item) for item in order_item_object] # collections data
        # global_dict['order_item_response_list'] = []
        c_ = 3
        for index,item in enumerate(order_item_object, 1):
            c_+=1
            d = model_to_dict(item)
            # print(d)
            d['order_item_keepflow_bool'] = ''
            if d['order_item_keepflow'] == 'yes':
                d['order_item_keepflow_bool'] = True
                
            elif d['order_item_keepflow'] == 'no':
                d['order_item_keepflow_bool'] = False
            
            
            
            d['order_item_knobfamily_bool'] = False
            
            if d['order_item_knobfamily']!='':
                d['order_item_knobfamily_bool'] = True
            knobs_tracker.append({
                d['order_item_collection_barcode']: 'yes' if d['order_item_knobfamily_bool'] else 'no',
                'id':3 + (index - 1),
                'knob_family':d['order_item_knobfamily'],
                'knob_color':d['order_item_knobcolor'],
            })
            keep_flow_tracker.append({
                d['order_item_collection_barcode']: d['order_item_keepflow'],
            })
            
            d['counter'] = 3 + (index - 1)
            global_dict[f'collection_{index}'] = d
            
        global_dict['c_'] =  c_
        # print(global_dict['collection_1'])
        global_dict['knobs_tracker'] =  knobs_tracker
        global_dict['keep_flow_tracker'] = keep_flow_tracker
        global_dict['order_item_response_list_length'] = len(order_item_object)
        # print(global_dict)
        card_item_object = Cards.objects.filter(order_track_id = order_track_response['order_track_id'])
        card_item_response_list = [model_to_dict(item) for item in card_item_object]
        card = {}
        global_dict['cards_count'] = len(card_item_response_list)
        # print("card_item_response_list=>",card_item_response_list)
        have_drawer,have_clap,have_hinge  = 0,0,0
        for index, card_item_response in enumerate (card_item_response_list, 1):
            # print(index, card_item_response)
            dic = dict()
            drawer_item_response_list = []
            clap_item_response_list = []
            hinge_item_response_list = []
            # print(index, card_item_response['have_drawer'], card_item_response['have_clap'], card_item_response['have_hinge'])
            # print(index,"have_drawer", "have_clap","have_hinge")
            if card_item_response['have_drawer'] == True:
                
                drawer_items_queryset = DrawarOrder.objects.filter(order_track__order_id = global_dict['order_id'])
                # print(drawer_items_queryset)
                drawer_item_response_list = [model_to_dict(item) for item in drawer_items_queryset]
                
                drawer_item_response_list = [drawer_item_response_list[have_drawer]]
                have_drawer += 1
                # print("have_drawer",drawer_item_response_list)
            
            if card_item_response['have_clap'] == True:
                clap_item_queryset = ClapOrder.objects.filter(order_track__order_id = global_dict['order_id'])
                clap_item_response_list =  [model_to_dict(item) for item in clap_item_queryset]
                clap_item_response_list = [clap_item_response_list[have_clap]]
                have_clap += 1
            
            if card_item_response['have_hinge'] == True:
                hinge_item_queryset = HingeOrder.objects.filter(order_track__order_id = global_dict['order_id'])
                hinge_item_response_list =  [model_to_dict(item) for item in hinge_item_queryset]
                hinge_item_response_list = [hinge_item_response_list[have_hinge]]
                have_hinge += 1

            dic[f'card_drawer'], dic[f'card_drawer_length'] = drawer_item_response_list, len(drawer_item_response_list)
            dic[f'card_clap'], dic[f'card_clap_length'] = clap_item_response_list, len(clap_item_response_list)
            dic[f'card_hinge'], dic[f'card_hinge_length'] = hinge_item_response_list, len(hinge_item_response_list)
            #dic[f'card_data_{index}'] = card_item_response
            dic['helper_value_english'] = ''
            dic['helper_value_hebrew'] = ''
            #dic['knob_model'] = card_item_response['knob']
            # dic['knob_model'] = card_item_response['knob_model']
            dic['knob_family'] = ''
            dic['knob_model'] = ''
            if card_item_response['knob'] != translations['without knob'] and card_item_response['knob']!='':
                knob_queryset = Knob.objects.filter(knob_id = card_item_response['knob']).first()
                knob_dict = model_to_dict(knob_queryset)
                dic['knob_family'] = knob_dict['knob_family']
                dic['knob_model'] = knob_dict['knob_model']
            
            if len(card_item_response['knob_position_id']) > 0:
                helper_queryset = helperTables.objects.filter(helper_table_id = card_item_response['knob_position_id']).first()
                helper_dict = model_to_dict(helper_queryset)
                dic['helper_value_english'] = helper_dict['helper_value_english']
                dic['helper_value_hebrew'] = helper_dict['helper_value_hebrew']
            # card_item_response['collection_barcode'] = ''
            # if card_item_response['collection_barcode_id']!='':
            #     collection_queryset = Collection.objects.filter(collection_id = int(card_item_response['collection_barcode_id'])).first()
            #     collection_obj = model_to_dict(collection_queryset)
            #     print(collection_obj)
            #     card_item_response['collection_barcode'] =  collection_obj['collection_barcode']
            card[f'card_{index}'] =   {**dic, **card_item_response}
        global_dict['cards'] = json.dumps(card)
        #print(global_dict['cards'])
        global_dict['OrderData'] = translations
        global_dict['ReservationData'] = Reservation
    # print(global_dict['collection_data'])
    return render (request, 'super_admin/edit_darft_order.html', context = global_dict)




@role_required(allowed_roles=['client','admin','super admin'])
def order_services_to_delievered_orders(request):
    
    # translations = get_translation('Reservation')
    if not request.GET.get('get_data'):
        company_name = request.user.company_name
        employ_name = request.user.employee_name
        employ_last_name = request.user.employee_last_name
        translations = get_translation('Reservation')
        context = {'data':translations,'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name}
        # data = {'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name}
        return render(request, 'super_admin/order_services_to_delievered_orders.html', context=context)
    else:
        if request.user.role_id in [1,2]:
            # all_orders_data = OrderTrack.objects.filter(order_status='complete').order_by('-created_at')
            data = get_all_orders(order_status='complete')
        else:
            # user_id = request.user.id
            data = get_all_orders(user_id=request.user.id, order_status='complete')
            # all_orders_data = OrderTrack.objects.filter(user_id=user_id, order_status='complete').order_by('-created_at')
        
        # data = [{
        #     'order_track_id':item.order_track_id,
        #     'order_id':str(item.order_id),
        #     'client_order_name':item.client_order_name,
        #     'client_order_id':item.client_order_id,
        #     'order_status':item.order_status,
        #     'related_reservation':'Yes' if item.related_reservation else 'No',
        #     'product_type':item.product_type,
        #     'order_decision_tracker':item.order_decision_tracker,
        #     'type_of_reservation':item.type_of_reservation,
        #     'order_collection_entries_count':item.order_collection_entries_count,
        #     'order_cards_rows_count':item.order_cards_rows_count,
        #     'created_at':item.created_at,
        #      'updated_at':  format_registered_date(item.updated_at),
        #     } for item in all_orders_data]
        return JsonResponse({'data':data},safe=False)
    

@role_required(allowed_roles=['client','admin','super admin'])
def order_that_sent_to_factory(request):
    if not request.GET.get('get_data'):
        company_name = request.user.company_name
        employ_name = request.user.employee_name
        employ_last_name = request.user.employee_last_name
        # data = {'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name}
        translations = get_translation('Reservation')
        context = {
            'data':translations,'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name,
            'view_btn':  "לצפיה בהזמנה" ,'edit_btn':"ערוך הזמנה",'delete_btn': "הורד אקסל להזמנה", 'download_btn': "הורד תמונת סיבים"
        }
        return render(request, 'super_admin/order_that_sent_to_factory.html', context=context)
    else:
        if request.user.role_id in [1,2]:
            # all_orders_data = OrderTrack.objects.filter(order_status='sent').order_by('-created_at')
            data = get_all_orders(order_status='sent')
        else:
            user_id = request.user.id
            #all_orders_data = OrderTrack.objects.filter(user_id=user_id, order_status='sent').order_by('-created_at')
            data = get_all_orders(user_id=user_id,order_status='sent')
        
        # data = [{
        #     'order_track_id':item.order_track_id,
        #     'order_id':str(item.order_id),
        #     'client_order_name':item.client_order_name,
        #     'client_order_id':item.client_order_id,
        #     'order_status':item.order_status,
        #     'related_reservation':'Yes' if item.related_reservation else 'No',
        #     'product_type':item.product_type,
        #     'order_decision_tracker':item.order_decision_tracker,
        #     'type_of_reservation':item.type_of_reservation,
        #     'order_collection_entries_count':item.order_collection_entries_count,
        #     'order_cards_rows_count':item.order_cards_rows_count,
        #     'created_at':item.created_at,
        #      'updated_at': format_registered_date(item.updated_at),
        #     } for item in all_orders_data]
        return JsonResponse({'data':data},safe=False)

@role_required(allowed_roles=['super admin','admin','client'])
def track_order_delivers_to_clients(request):
    if not request.GET.get('get_data'):
        company_name = request.user.company_name
        employ_name = request.user.employee_name
        employ_last_name = request.user.employee_last_name
        # data = {'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name}
        translations = get_translation('Reservation')
        context = {'data':translations,'company_name':company_name,'employ_name':employ_name,'employ_last_name':employ_last_name}
        return render(request, 'super_admin/track_order_delivers_to_clients.html', context=context)
    else:
        if request.user.role_id in [1,2]:
            data = get_all_orders(order_status='complete')
            # all_orders_data = OrderTrack.objects.filter(order_status='complete').order_by('-created_at')
        else:
            user_id = request.user.id
            data = get_all_orders(user_id=user_id, order_status='complete')
            # all_orders_data = OrderTrack.objects.filter(user_id=user_id, order_status='complete').order_by('-created_at')
            
        # data = [{
        #         'order_track_id':item.order_track_id,
        #         'order_id':str(item.order_id),
        #         'client_order_name':item.client_order_name,
        #         'client_order_id':item.client_order_id,
        #         'order_status':item.order_status,
        #         'related_reservation':'Yes' if item.related_reservation else 'No',
        #         'product_type':item.product_type,
        #         'order_decision_tracker':item.order_decision_tracker,
        #         'type_of_reservation':item.type_of_reservation,
        #         'order_collection_entries_count':item.order_collection_entries_count,
        #         'order_cards_rows_count':item.order_cards_rows_count,
        #         'created_at':item.created_at,
        #         'updated_at': item.updated_at,
        #         } for item in all_orders_data]
        return JsonResponse({'data':data},safe=False)


@role_required(allowed_roles=['super admin','admin','client'])
def CreateFormicaOrder(request):
    order_id = str(datetime.now().year % 100) +  str(random.randint(10000,99999))
    #data = {'order_id':order_id, 'order_date':datetime.now(),'order_status':'draft', 'success':1,'product_type':'formica'}
    translations = get_translation('create new order')
    Reservation = get_translation('Reservation')
    time_zone = settings.TIME_ZONE
    datetime_now = datetime.now(pytz.timezone(time_zone))
    data = {'data':translations,'data1':Reservation,'order_id':order_id, 'order_date':datetime_now,'order_status':'draft', 'success':1,'product_type':translations['formica'],'past_order_id':'','have_past_order':0, 'order_status_show':Reservation['draft']}
    
    past_order_id = request.GET.get('order_id')
    
    if past_order_id:
        data = {'data':translations,'data1':Reservation,'order_id':order_id, 'order_date':datetime_now,'order_status':'draft', 'success':1,'product_type':translations['formica'],'past_order_id':past_order_id, 'have_past_order':1, 'order_status_show':Reservation['draft']}
        
    return render(request,'super_admin/add_client_formica_order.html', context=data)




# @role_required(allowed_roles=['super admin','client'])
# def CreateKantsOrder(request):
#     order_id = str(random.randint(1,10**3)+ time.time() + random.randint(1,10**5)).replace(".","")
#     data = {'order_id':order_id, 'order_date':datetime.datetime.now(),'order_status':'draft', 'success':1,'product_type':'kants'}
#     return render(request,'super_admin/add_client_kants_order.html', context=data)


# @role_required(allowed_roles=['super admin','client'])
# def CreateDockshelfeOrder(request):
#     order_id = str(random.randint(1,10**3)+ time.time() + random.randint(1,10**5)).replace(".","")
#     data = {'order_id':order_id, 'order_date':datetime.datetime.now(),'order_status':'draft', 'success':1,'product_type':'dock_shelfe'}
#     return render(request,'super_admin/add_client_dock_shelfe_order.html', context=data)


@role_required(allowed_roles=['super admin','admin','client'])
def CreatePaltesOrder(request):
    # order_id = str(random.randint(1,10**3)+ time.time() + random.randint(1,10**5)).replace(".","")
    order_id = str(datetime.now().year % 100) +  str(random.randint(10000,99999))
    translations = get_translation('create new order')
    Reservation = get_translation('Reservation')
    time_zone = settings.TIME_ZONE
    datetime_now=datetime.now(pytz.timezone(time_zone))
    data = {'data':translations,'data1':Reservation,'order_id':order_id, 'order_date':datetime_now,'order_status':'draft', 'success':1,'product_type':translations['plates'],'past_order_id':'','have_past_order':0, 'order_status_show':Reservation['draft']}
    past_order_id = request.GET.get('order_id')
    
    if past_order_id:
        data = {'data':translations,'data1':Reservation,'order_id':order_id, 'order_date':datetime_now,'order_status':'draft', 'success':1,'product_type':translations['plates'],'past_order_id':past_order_id, 'have_past_order':1, 'order_status_show':Reservation['draft']}
    return render(request,'super_admin/add_client_paltes_order.html', context=data)

def formater_num(number):    
    return "{:.2f}".format(number)


def format_number(num):
    return num
    

# def generate_pdf_file():

def formater_num(number):
    if number!='' and number>0:
        return "{:.2f}".format(number)
    else:
        # print("tagss",len(number))
        return ""

@role_required(allowed_roles=['super admin','admin','client'])
def viewOrderDetails(request):
    order_id = int(request.GET.get('order_id'))
    
    order_track_obj = OrderTrack.objects.filter(order_id = order_id).first()
    #order_item_response_list = []
    
    order_track_response = {}
    card_item_response_list = []
    knob_families = []
    global_dict = {}
    global_dict['OrderData'] = get_translation('create new order')
    if order_track_obj:
        order_track_response = model_to_dict(order_track_obj)
        # print(order_track_response)
        # order_track_response['created_at'] = order_track_obj.created_at
        #print(order_track_response)
        user_info_queryset = EliteNovaUser.objects.filter(id = order_track_response['user']).first()
        user_info_obj = model_to_dict(user_info_queryset)
        order_item_object = OrderItems.objects.filter(order_track_id = order_track_response['order_track_id'])
        order_track_response['company_name'] = user_info_obj['company_name'] 
        order_track_response['employee_name'] = user_info_obj['employee_name']
        order_track_response['employee_last_name'] = user_info_obj['employee_last_name']
        order_track_response['order_decision_tracker_bool'] = True if order_track_response['order_decision_tracker'] == 'yes' else False
        #order_track_response['order_decision_tracker'] = global_dict['OrderData'][order_track_response['order_decision_tracker']]
        global_dict['order_track_response'] = order_track_response
        # print("order_track_response",global_dict['order_track_response'])
        global_dict['order_item_response_list'] =  [model_to_dict(item) for item in order_item_object] # collections data
        # for item in global_dict['order_item_response_list']:
        #     if item['order_item_keepflow']!='':
        #         item['order_item_keepflow'] = global_dict['OrderData'][item['order_item_keepflow']]

        # print("order_item_response_list",global_dict['order_item_response_list'])
        # global_dict['order_item_response_list_length'] = len(global_dict['order_item_response_list'])

        card_item_object = Cards.objects.filter(order_track_id = order_track_response['order_track_id'])
        card_item_response_list = [model_to_dict(item) for item in card_item_object]
        card = {}
        total_quantity,total_meter, total_knob_width = 0,0,0
        
        # print("card_item_response_list_length",len(card_item_response_list))
        long_list = []
        for index, card_item_response in enumerate (card_item_response_list, 1):
            
            dic = dict()
            have_drills = 0
            # print(card_item_response)
            # exit() 
            if card_item_response['have_hinge'] == True or card_item_response['have_drawer'] == True or card_item_response['have_clap'] == True:
                have_drills = 1
            unique_identifier = card_item_response['unique_identifier']
            
            dic['knob_model'] = card_item_response['knob']
            dic['knob_family_bool'] = False
            dic['knob_family'] = ''
            if card_item_response['knob'] != '':
                
                knob_queryset = Knob.objects.filter(knob_id = card_item_response['knob']).first()
                if knob_queryset is not None:
                    knob_dict = model_to_dict(knob_queryset)
                    dic['knob_family'] = knob_dict['knob_family']
                    knob_families.append(knob_dict['knob_family'])
                    dic['knob_family_bool'] = True
                
            dic['helper_value_english'] = ''
            dic['helper_value_hebrew'] = ''
            dic['helper_value_english_final'] = ''
            dic['connected_knob_check']=''
            dic['knob_width'] = ""
            plus_btn = '<h3>+</h3>'
            
            if len(card_item_response['knob_position_id']) > 0:
                helper_queryset = helperTables.objects.filter(helper_table_id = card_item_response['knob_position_id']).first()
                helper_dict = model_to_dict(helper_queryset)
                dic['helper_value_english'] = helper_dict['helper_value_english']
                # if helper_dict['helper_value_english'] in ["upper","lower"]:
                #     dic['helper_value_english_final'] = round(card_item_response['card_width'],2)
                # elif helper_dict['helper_value_english'] in ["width right","width left"]:
                #     dic['helper_value_english_final'] = round(card_item_response['card_height'],2)
                # elif helper_dict['helper_value_english'] in ["connected knob"]:
                #     dic['helper_value_english_final'] = helper_dict['helper_value_hebrew']
                #     dic['connected_knob_check'] = plus_btn

                if helper_dict['helper_value_english'] in ["upper","lower"]:
                    dic['helper_value_english_final'] = round((card_item_response['card_width']/10 ) * card_item_response['card_quantity'],2)
                    dic['knob_width'] = float(dic['helper_value_english_final'])
                    total_knob_width += dic['knob_width']
                elif helper_dict['helper_value_english'] in ["width right","width left"]:
                    
                    dic['helper_value_english_final'] = round((card_item_response['card_height']/10 ) * card_item_response['card_quantity'],2)
                    dic['knob_width'] = float(dic['helper_value_english_final'])
                    total_knob_width += dic['knob_width']
                elif helper_dict['helper_value_english'] in ["connected knob"]:
                    dic['helper_value_english_final'] = helper_dict['helper_value_hebrew']
                    dic['connected_knob_check'] = plus_btn
                
                #dic['helper_value_english_final'] = card_item_response['card_width'] if helper_dict['helper_value_english'] in ["upper","lower"] else dic['helper_value_english']
                
                dic['helper_value_hebrew'] = helper_dict['helper_value_hebrew']

            multiplier_check = round(float( card_item_response['card_width']),1) * round (float(card_item_response['card_height']),1)
            min_order_of_collection = 0
            collection_barcode = ""
            
            if order_track_response['order_decision_tracker_bool'] == False: 
                # print( global_dict['order_item_response_list'])
                collection_queryset = Collection.objects.filter(collection_barcode = global_dict['order_item_response_list'][0]['order_item_collection_barcode']).first()
                collection_obj = model_to_dict(collection_queryset)   
                min_order_of_collection = float(collection_obj['min_order'])
                collection_barcode = global_dict['order_item_response_list'][0]['order_item_collection_barcode']
                multiplier_check = multiplier_check/1000000
                if multiplier_check >  min_order_of_collection:
                    value =  float(multiplier_check) * float(card_item_response['card_quantity'])
                    dic['meter'] = value
                else:
                        
                    value =  float(min_order_of_collection) * float(card_item_response['card_quantity'])
                    dic['meter'] = value
            else:
                # dic['collection_barcode']= ''
                # print(index, card_item_response['collection_barcode_id'])
                if card_item_response['collection_barcode_id']!='':
                    collection_queryset = Collection.objects.filter(collection_id = card_item_response['collection_barcode_id']).first()
                    collection_obj = model_to_dict(collection_queryset)
                    
                    collection_barcode = collection_obj['collection_barcode']
                    min_order_of_collection = float(collection_obj['min_order'])
                    multiplier_check = multiplier_check/1000000
                    if multiplier_check >  min_order_of_collection:
                        value =  float(multiplier_check) * float(card_item_response['card_quantity'])
                        dic['meter'] = value
                    else:
                        value =  float(min_order_of_collection) * float(card_item_response['card_quantity'])
                        dic['meter'] = value

            dic['collection_barcode'] = collection_barcode
            # print(dic['meter'])
            #print(min_order_of_collection)
            # dic['meter'] = round(value,2) if value!='' else value
            # print(card_item_response['collection_barcode_id'], dic['meter'])
            total_quantity += int(card_item_response['card_quantity'])
            total_meter += 0 if 'meter' not in dic else dic['meter']
            
            #create new order
            # print(card_item_response['knob'])
            # if card_item_response['knob']!='': 
            # # if len(card_item_response['knob_position_id']) > 0:
            #     dic['knob_width'] = float(card_item_response['card_width'])
            #     total_knob_width += dic['knob_width']
            dic['have_drills'] = plus_btn if have_drills==1 else ""
            dic['have_notes'] = plus_btn if len(card_item_response['card_notes']) > 0 else ""
            card_item_response['card_height'] = format_number(card_item_response['card_height'])
            card_item_response['card_width'] = format_number(card_item_response['card_width'])
            card[f'card_{index}'] = {**dic, **card_item_response}
            temp_list = [
                        index, collection_barcode, format_number(card_item_response['card_height']),format_number(card_item_response['card_width']),
                        card_item_response['card_quantity'], formater_num(dic['meter']), formater_num(dic['knob_width']), dic['connected_knob_check'].replace("<h3>","").replace("</h3>",""), dic['have_drills'].replace("<h3>","").replace("</h3>",""),
                        dic['have_notes'].replace("<h3>","").replace("</h3>","")
            ]
            long_list.append(temp_list)
        global_dict['cards'] = card
        # print(global_dict['cards'])
        global_dict['ReservationData'] = get_translation('Reservation')
        global_dict['productsData'] = get_translation('products')
        knob_families = list(set(knob_families))
        global_dict['knob_families'] = ' ,'.join(knob_families)
        global_dict['viewOrderDetailsData'] = get_translation('View Order Details')
        global_dict['total_quantity'], global_dict['total_meter'], global_dict['total_knob_width'] = total_quantity ,round(total_meter,2), total_knob_width/100
        global_dict['data_table'] = get_translation('Reservation')
        global_dict['login_data']=get_translation('log in')
        global_dict['data_products']=get_translation('products') 
        global_dict['admin_data']=get_translation('admin')
        global_dict['order_id'] = int(request.GET.get('order_id'))
    # print(global_dict)
    #print(knob_families)
    # html_content = render_to_string('super_admin/view_client_order_details.html', context=global_dict)
    # pdf = pdfkit.from_string(html_content, False)  # Pass False to get PDF as binary data instead of saving to file
    # response = HttpResponse(pdf, content_type='application/pdf')
    # response['Content-Disposition'] = 'attachment; filename="order_details.pdf"'
    # return response
    # cols = [
    #     global_dict['OrderData'].get("row"),
    #     global_dict['productsData'].get("collection_barcode"),
    #     global_dict['OrderData'].get("height "),
    #     global_dict['OrderData'].get("width"),
    #     global_dict['OrderData'].get("quantity"),
    #     global_dict['OrderData'].get("meter"),
    #     global_dict['OrderData'].get("knob_width"),
    #     global_dict['OrderData'].get("connected_knob"),
    #     global_dict['OrderData'].get("drills"),
    #     global_dict['OrderData'].get("notes")
    # ]
    # generate_pdf_file(cols, long_list, order_id)
    return render (request, 'super_admin/view_client_order_details.html', context = global_dict)


# from fpdf import FPDF
# def generate_pdf_file(columns, data, order_id):
#     # Combine headers and data into the TABLE_DATA structure
#     TABLE_DATA = tuple([tuple(columns)] + [tuple(row) for row in data])
#     pdf = FPDF()
#     pdf.add_page()
#     pdf.set_font("Arial", size=10)

#     # Calculate column width based on page width
#     page_width = pdf.w - 2 * pdf.l_margin
#     col_width = page_width / len(columns)

#     # Add table header
#     pdf.set_font("Arial", style="B", size=10)
#     for header in columns:
#         pdf.cell(col_width, 10, header, border=1, align='C')
#     pdf.ln()

#     # Add table rows
#     pdf.set_font("Arial", size=10)
#     for row in data:
#         for item in row:
#             pdf.cell(col_width, 10, str(item), border=1, align='C')
#         pdf.ln()
#     fn = f"media/uploaded_images/{order_id}_data.pdf"
#     print(f"file created {fn}")
#     pdf.output(fn)
# """ Commenting it for future use """
# @role_required(allowed_roles=['super admin','admin','client'])
# def viewOrderDetails(request):
#     order_id = int(request.GET.get('order_id'))
    
#     order_track_obj = OrderTrack.objects.filter(order_id = order_id).first()
#     order_item_response_list = []
#     order_track_response = {}
#     card_item_response_list = []
#     global_dict = {}
#     global_dict['OrderData'] = get_translation('create new order')
#     if order_track_obj:
#         order_track_response = model_to_dict(order_track_obj)
#         # print(order_track_response)
#         order_track_response['created_at'] = order_track_obj.created_at
#         #print(order_track_response)
#         user_info_queryset = EliteNovaUser.objects.filter(id = order_track_response['user']).first()
#         user_info_obj = model_to_dict(user_info_queryset)
#         order_item_object = OrderItems.objects.filter(order_track_id = order_track_response['order_track_id'])
#         order_track_response['company_name'] = user_info_obj['company_name'] 
#         order_track_response['employee_name'] = user_info_obj['employee_name']
#         order_track_response['employee_last_name'] = user_info_obj['employee_last_name']
#         order_track_response['order_decision_tracker_bool'] = True if order_track_response['order_decision_tracker'] == 'yes' else False
#         order_track_response['order_decision_tracker'] = global_dict['OrderData'][order_track_response['order_decision_tracker']]
#         global_dict['order_track_response'] = order_track_response
#         print("order_track_response",global_dict['order_track_response'])
#         global_dict['order_item_response_list'] =  [model_to_dict(item) for item in order_item_object] # collections data
#         for item in global_dict['order_item_response_list']:
#             if item['order_item_keepflow']!='':
#                 item['order_item_keepflow'] = global_dict['OrderData'][item['order_item_keepflow']]

#         print("order_item_response_list",global_dict['order_item_response_list'])
#         global_dict['order_item_response_list_length'] = len(global_dict['order_item_response_list'])

#         card_item_object = Cards.objects.filter(order_track_id = order_track_response['order_track_id'])
#         card_item_response_list = [model_to_dict(item) for item in card_item_object]
#         card = {}
        
#         # print("card_item_response_list_length",len(card_item_response_list))
#         for index, card_item_response in enumerate (card_item_response_list, 1):
            
#             dic = dict()
#             drawer_item_response_list = []
#             clap_item_response_list = []
#             hinge_item_response_list = []
            
#             if card_item_response['have_drawer'] == True:
#                 # print(index, card_item_response['have_drawer'])
#                 drawer_items_queryset = DrawarOrder.objects.filter(
#                     order_track_id=order_track_response['order_track_id'],
#                     unique_identifier=card_item_response['unique_identifier']
#                 ).values_list('drawar_order_id', flat=True)
#                 # print(drawer_items_queryset)
#                 list_ =  [drawar_order_id for drawar_order_id in drawer_items_queryset]
#                 #len
#                 #print(index, len(list_))
#                 # if get_value_by_index(list_, index - 1)!="":
#                 query = DrawarOrder.objects.filter(
#                     drawar_order_id = list_[0]
#                 )
#                 drawer_item_response_list = [model_to_dict(k) for k in query]
                

            
            
#             if card_item_response['have_clap'] == True:
#                 clap_item_queryset = ClapOrder.objects.filter(
#                     order_track_id=order_track_response['order_track_id'],
#                     unique_identifier=card_item_response['unique_identifier']
#                 ).values_list('clap_order_id', flat=True)
#                 list_ =  [clap_order_id for clap_order_id in clap_item_queryset]
#                 # if get_value_by_index(list_, index - 1)!="":
#                 query = ClapOrder.objects.filter(
#                     clap_order_id = list_[0]
#                 )
#                 clap_item_response_list = [model_to_dict(k) for k in query]

#             if card_item_response['have_hinge'] == True:
#                 hinge_item_queryset = HingeOrder.objects.filter(
#                     order_track_id=order_track_response['order_track_id'],
#                     unique_identifier=card_item_response['unique_identifier']
#                 ).values_list('hinge_order_id', flat=True)
#                 list_ =  [hinge_order_id for hinge_order_id in hinge_item_queryset]
#                 # if get_value_by_index(list_, index - 1) !="" :
#                 query = HingeOrder.objects.filter(
#                     hinge_order_id = list_[0]
#                 )
#                 hinge_item_response_list = [model_to_dict(k) for k in query]
           
#             dic[f'card_drawer'], dic[f'card_drawer_length'] =  drawer_item_response_list,len(drawer_item_response_list)
#             dic[f'card_clap'], dic[f'card_clap_length'] = clap_item_response_list, len(clap_item_response_list)
#             dic[f'card_hinge'], dic[f'card_hinge_length'] = hinge_item_response_list, len(hinge_item_response_list)
#             dic['knob_model'] = card_item_response['knob']
#             dic['knob_family_bool'] = False
#             dic['knob_family'] = ''
#             if card_item_response['knob'] != global_dict['OrderData']['without knob']:
#                 # print(card_item_response['knob'])
#                 knob_queryset = Knob.objects.filter(knob_model = card_item_response['knob']).first()
#                 if knob_queryset is not None:
#                     knob_dict = model_to_dict(knob_queryset)
#                     # print(knob_dict)
#                     dic['knob_family'] = knob_dict['knob_family']
#                     dic['knob_family_bool'] = True
                
#             dic['helper_value_english'] = ''
#             dic['helper_value_hebrew'] = ''

#             if len(card_item_response['knob_position_id']) > 0:
#                 helper_queryset = helperTables.objects.filter(helper_table_id = card_item_response['knob_position_id']).first()
#                 helper_dict = model_to_dict(helper_queryset)
#                 dic['helper_value_english'] = helper_dict['helper_value_english']
#                 dic['helper_value_hebrew'] = helper_dict['helper_value_hebrew']
            

    
#             card_item_response['collection_barcode'] = ''
#             if card_item_response['collection_barcode_id']!='':
#                 collection_queryset = Collection.objects.filter(collection_id = card_item_response['collection_barcode_id']).first()
#                 collection_obj = model_to_dict(collection_queryset)
#                 card_item_response['collection_barcode'] =  collection_obj['collection_barcode']
#             card[f'card_{index}'] = {**dic, **card_item_response}
            
#         global_dict['cards'] = card
        
#         global_dict['ReservationData'] = get_translation('Reservation')
        
#         global_dict['viewOrderDetailsData'] = get_translation('View Order Details')
#         # print( global_dict['cards'])
#     return render (request, 'super_admin/view_client_order_details.html', context = global_dict)
    

@role_required(allowed_roles=['super admin','admin','client'])
def orderPageAjaxCalls(request):
    if request.method == "POST":
        data_requirement = request.POST.get('data_requirement')
        if data_requirement == "collection":
            all_collection_cls = Collection.objects.all()
            data = [{"collection_id": collection.collection_id,
            "collection_name": collection.collection_name,
            "collection_barcode": collection.collection_barcode,
            "description": collection.description,
            "back": collection.back,
            "kant": collection.kant,
            "min_order": collection.min_order,
            "in_stock":  'Yes' if collection.in_stock == 1 else 'No',
            "in_stock_bool": collection.in_stock,
            "flow": 'Yes' if collection.flow == 1 else 'No',
            "flow_bool":collection.flow,
            "height": collection.height,
            "width": collection.width,
            "kant_code": collection.kant_code,
            "formica": 'Yes' if collection.formica == 1 else 'No',
            "formica_bool":collection.formica
            } for collection in all_collection_cls]
            return JsonResponse({'data':data})
        elif data_requirement == "knob_family":
            # all_knob_cls = Knob.objects.all()
            # data = [{'knob_id': knob.knob_id, 'knob_family': knob.knob_family, 'knob_model': knob.knob_model, 'two_parts_knob': 'Yes' if knob.two_parts_knob == 1 else 'No', 'knob_color': 'Yes' if knob.color == 1 else 'No','knob_color_bool': knob.color, 'knob_size': knob.knob_size, 'button_height': knob.button_height} for knob in all_knob_cls]
            # return JsonResponse({'data': data}, safe=False)
            all_knob_cls = Knob.objects.all().values('knob_id', 'knob_family', 'knob_model', 'two_parts_knob', 'color', 'knob_size', 'button_height').distinct('knob_family')
            data = [{'knob_id': knob['knob_id'], 
                    'knob_family': knob['knob_family'], 
                    'knob_model': knob['knob_model'], 
                    'two_parts_knob': 'Yes' if knob['two_parts_knob'] == 1 else 'No', 
                    'knob_color': 'Yes' if knob['color'] == 1 else 'No',
                    'knob_color_bool': knob['color'], 
                    'knob_size': knob['knob_size'], 
                    'button_height': knob['button_height']} 
                    for knob in all_knob_cls]
            return JsonResponse({'data': data}, safe=False)
        elif data_requirement == "specific_knob_family":
            knob_family_dict = {}
            knob_families = request.POST.getlist("knob_family[]")
            # print(knob_families)
            for family in knob_families:
                knobs_for_family = Knob.objects.filter(knob_family=family).values_list('knob_model', flat=True)
                knob_family_dict[family] = list(knobs_for_family)
            return JsonResponse({'data':knob_family_dict}, safe=False)
            # label_list = []
            # model_list = []
            # for knob in all_knob_cls:
            #     label_list.append(knob.knob_family)
            #     model_list.append()



        elif data_requirement == "drawer":
            all_drawers = Drawer.objects.all()
            unique_drawer_types = set()
            data = []

            for drawer in all_drawers:
                if drawer.drawer_type not in unique_drawer_types:
                    data.append({
                        'drawer_id': drawer.drawer_id,
                        'drawer_type': drawer.drawer_type,
                        'drawer_code': drawer.drawer_code
                    })
                    unique_drawer_types.add(drawer.drawer_type)
            #data = [{'drawer_id': drawer.drawer_id, 'drawer_type': drawer.drawer_type, 'drawer_code': drawer.drawer_code} for drawer in all_drawers]
            # all_drawer_types = Drawer.objects.values_list('drawer_type', flat=True).distinct()
            # data = list(all_drawer_types)
            return JsonResponse({'data': data}, safe=False)

        elif data_requirement == "specific_drawer":
            drawer_type = request.POST.get('drawer_type')
            all_drawers = Drawer.objects.filter(drawer_type=drawer_type)
            #unique_drawer_types = set()
            data = {'selected_codes':[],'all_drawers':[]}
            for drawer in all_drawers:
                    data['selected_codes'].append({
                        'drawer_id': drawer.drawer_id,
                        'drawer_type': drawer_type,
                        'drawer_code': drawer.drawer_code
                    })
            unique_drawer_types = set()
            # data = []
            all_drawers = Drawer.objects.all()
            for drawer in all_drawers:
                if drawer.drawer_type not in unique_drawer_types:
                    data['all_drawers'].append({
                        'drawer_id': drawer.drawer_id,
                        'drawer_type': drawer.drawer_type,
                        'drawer_code': drawer.drawer_code
                    })
                    unique_drawer_types.add(drawer.drawer_type)

            #data = [{'drawer_id': drawer.drawer_id, 'drawer_type': drawer.drawer_type, 'drawer_code': drawer.drawer_code} for drawer in all_drawers]
            # all_drawer_types = Drawer.objects.values_list('drawer_type', flat=True).distinct()
            # data = list(all_drawer_types)
            return JsonResponse({'data': data}, safe=False)

        elif data_requirement == "knob_color":
            all_knob_cls = ColorKnob.objects.all()
            data = [{'colorknob_id': knob.colorknob_id, 'colorknob_barcode': knob.colorknob_barcode, 'colorknob_description': knob.colorknob_description,'colorknob_color':knob.colorknob_color} for knob in all_knob_cls if knob.colorknob_color==1]   
            return JsonResponse({'data': data}, safe=False)
        elif data_requirement == "get_specific_drawer_codes":
            drawer_type = request.POST.get('drawer_type')
            all_drawers = Drawer.objects.filter(drawer_type =drawer_type )
            data = [{'drawer_id': drawer.drawer_id, 'drawer_code': drawer.drawer_code} for drawer in all_drawers]
            return JsonResponse({'data': data}, safe=False)
        # elif data_requirement == "get_knob_colors_with_knob_family":

        #     pass
        elif data_requirement in ["knob_position","door_opening_side","hinge_provider","claps_pr_order"]:
            all_hlp = helperTables.objects.filter(helper_data_helper_name=data_requirement)
            data = [{'helper_table_id': d.helper_table_id, 'helper_value_hebrew': d.helper_value_hebrew, 'helper_value_english': d.helper_value_english, 'helper_data_helper_name':d.helper_data_helper_name} for d in all_hlp]

            return JsonResponse({'data': data}, safe=False)
        


# for setting up the client views
@role_required(allowed_roles=['super admin','admin'])
def viewClients(request):

    users_list_of_dicts = []
    user_id = request.user.id
    users_query_set = EliteNovaUser.objects.filter(Q(role_id=3) , ~Q(id=user_id))
    today_date = datetime.now().date()  # Get today's date
    
    for user in users_query_set:
        d = {}
        # Assuming `last_visit_date` is the field storing the last visit date
        if user.last_login is not None:
            last_visit_date = user.last_login.date()
            difference_in_days = (today_date - last_visit_date).days
        else:
            difference_in_days = None
        d['id'] = user.id
        d['employee_name'] = user.employee_name
        d['employee_email'] = user.employee_email
        d['company_id'] = user.company_id
        d['company_name'] = user.company_name
        d['phone_number'] = user.phone_number
        d['registered_date'] = user.registered_date
        d['last_login'] = user.last_login
        d['is_active'] = user.is_active
        d['difference_in_days'] = '' if difference_in_days is None else f'{difference_in_days}'
        # d['difference_in_days'] = random.randint(1,100)
        users_list_of_dicts.append(d)
    # users_list_of_dicts = list(users_query_set.values())
    context = {'data':get_translation('super admin'),'client_data':get_translation('client'),'data_table':get_translation('Reservation'),'login_data':get_translation('log in'),'data_products':get_translation('products'), 'admin_data':get_translation('admin'), "clients":users_list_of_dicts
    }
    
    return render(request, 'super_admin/view_all_clients.html', context=context)


@role_required(allowed_roles=['super admin'])
def manageTranslations(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == "get_all_data":
            translations = Translations.objects.all()
            data = [{'translation_id': translation.translation_id, 'translation_page_name': translation.translation_page_name, 'translation_english_verion': translation.translation_english_verion,'translation_hebrew_verion':translation.translation_hebrew_verion, 'created_at': translation.created_at} for translation in translations]
            return JsonResponse({'data':data}, safe=False)
        elif action == "insert":
            page_name = request.POST.get('page_name')
            english_version = request.POST.get('english_version')
            hebrew_version = request.POST.get('hebrew_version')
            counter = Translations.objects.filter(translation_page_name=page_name, translation_english_verion=english_version).count()
            if counter == 0:
                new_translation = Translations(translation_page_name=page_name,translation_english_verion=english_version,translation_hebrew_verion=hebrew_version)
                new_translation.save()
                return JsonResponse({'msg': 'New Translation has been added successfully', 'success':1})
            else:
                return JsonResponse({'msg': 'This record is already exists', 'success':0})

    else:
        return render (request, 'super_admin/translations.html')




@role_required(allowed_roles=['super admin'])
def addClient(request):
    
    if request.method == 'POST':
        trans = get_translation('client')
        entry_type = request.POST.get('entry_type')

        if entry_type == 'single':
            company_name = request.POST.get('company_name')
            company_id = request.POST.get('company_id') 
            # employee_id = request.POST.get('employee_id')
            employee_name = request.POST.get('employee_name')
            employee_last_name = request.POST.get('employee_last_name')
            employee_email = request.POST.get('employee_email')
            employee_phone = request.POST.get('employee_phone')
            employee_password = request.POST.get('employee_password')
            user_role = request.POST.get('user_role')
            # for save case
            client_id = request.POST.get('client_id')
            
            if client_id is None: # for insert case
                existing_user = EliteNovaUser.objects.filter(employee_email=employee_email).count()
                #existing_user_name = EliteNovaUser.objects.filter(username=employee_name).count()
                # if existing_user_name > 0:
                #     return JsonResponse({'msg': trans['Client with this email is already exists'], 'success':False})
                
                
                if existing_user==0:
                    role = Role.objects.get(name=user_role)
                    new_user = EliteNovaUser.objects.create(
                        role=role,
                        company_name=company_name,
                        company_id=company_id,
                        # employee_id=client_id,
                        employee_name=employee_name,
                        employee_last_name=employee_last_name,
                        employee_email=employee_email,
                        email=employee_email,
                        phone_number=employee_phone,
                        password= make_password(employee_password), # hashing the pass
                        plain_password = employee_password,
                        is_active = True,
                        is_staff = False,
                        is_superuser = False,
                        # username = employee_name,
                    )
                    if new_user:
                        return JsonResponse({'msg': trans['Client has been created'], 'success':True})
                else:
                    return JsonResponse({'msg': trans['Client with this email is already exists'], 'success':False})
                    #return render(request, 'super_admin/add_super_admin.html',{'msg': 'Super Admin with this email is already exists', 'success':False})
            else: # for update case
                client_id = int (client_id)
                is_active = True if (int(request.POST.get('is_active'))) == 1 else False
                
                existing_user = EliteNovaUser.objects.get(id = client_id)
                if existing_user:
                    existing_user.company_name=company_name
                    existing_user.company_id=company_id
                    # existing_user.employee_id=client_id
                    existing_user.employee_name=employee_name
                    existing_user.employee_last_name=employee_last_name
                    existing_user.employee_email=employee_email
                    existing_user.email=employee_email
                    existing_user.phone_number=employee_phone
                    existing_user.password= make_password(employee_password) # hashing the pass
                    existing_user.plain_password = employee_password
                    # existing_user.username = employee_name
                    existing_user.is_active = is_active
                    try:
                        existing_user.save()
                        return JsonResponse({'msg': trans['Client details has been updated'], 'success':True})
                    except IntegrityError as e:
                        trans = get_translation('super admin')
                        return JsonResponse({'msg':trans["Save failed"], 'success':False})
                else:
                    trans = get_translation('super admin')
                    return JsonResponse({'msg': trans["Save failed"], 'success':False})
        else:# if entry type if bulk
            expected_columns = ["company_name","company_id","employee_name","account_password","employee_last_name","employee_email_address","employee_phone"]
            response = []
            success_ = 0
            user_role = request.POST.get('user_role')
            if 'bulk_upload_file' in request.FILES and request.FILES['bulk_upload_file']!='':
                df = pd.read_csv(request.FILES['bulk_upload_file'])
                df = df.fillna('')
                role = Role.objects.get(name=user_role)
                if len(df) > 0:
                    if set(df.columns) == set(expected_columns):
                        for index, (row_index, row_data) in enumerate(df.iterrows(), 1):

                            existing_user = EliteNovaUser.objects.filter(employee_email=row_data["employee_email_address"]).count()
                            # existing_user_name = EliteNovaUser.objects.filter(username=row_data["employee_name"]).count()
                            if existing_user > 0:
                                response.append({'msg': f'User with index#{index+1} {row_data["employee_email_address"]} is already exists', 'success':False})
                            else:
                                
                                account_password = str(row_data['account_password'])
                                if account_password=='':
                                    account_password = generate_password()
                                new_user = EliteNovaUser(
                                    role=role,
                                    company_name=row_data["company_name"],
                                    company_id=row_data["company_id"],
                                    # employee_id=row_data[""],
                                    employee_name=row_data["employee_name"],
                                    employee_last_name=row_data["employee_last_name"],
                                    employee_email=row_data["employee_email_address"],
                                    email=row_data["employee_email_address"],
                                    phone_number=row_data["employee_phone"],
                                    password= make_password(account_password), # hashing the pass
                                    plain_password = account_password,
                                    is_active = True,
                                    is_staff = False,
                                    is_superuser = False
                                )
                                new_user.save()
                                success_+=1
                        #return JsonResponse({'msg': f'Clients has been added successfully', 'success':1,'track':response})
                        trans = get_translation('client')
                        return JsonResponse({'msg': trans['Clients has been added successfully'], 'success':1,'track':response,'insert_count':success_})
                    else:
                        return JsonResponse({'msg': f'Error in reading columns, the columns must be only {len(expected_columns)} and with name of ({",".join(expected_columns)})', 'success':0})
                else:
                    trans = get_translation('products')
                    return JsonResponse({'msg': trans['Uploaded file must have some data, its seems empty file'], 'success':0})
            else:
                trans = get_translation('products')
                return JsonResponse({'msg':trans['Uploaded file must have some data, its seems empty file'], 'success':0})
    else:
        entry_type = request.GET.get('entry_type')
        context = {'entry_type':entry_type,'data':get_translation('super admin'),'client_data':get_translation('client'),'data_table':get_translation('Reservation'),'login_data':get_translation('log in'),'data_products':get_translation('products'), 'admin_data':get_translation('admin'),  
        }
        return render(request, 'super_admin/add_a_client.html', context=context)


@role_required(allowed_roles=['super admin']) 
def editClient(request,client_id):
    client = EliteNovaUser.objects.filter(id=client_id).values().first()
    client['is_active_bool'] = 1 if client['is_active'] else 0
    #context = {}
    context = {'data':get_translation('super admin'),'client_data':get_translation('client'),'data_table':get_translation('Reservation'),'login_data':get_translation('log in'),'data_products':get_translation('products'), 'admin_data':get_translation('admin'),  'client': client
    }
    return render(request, 'super_admin/edit_client.html', context=context)
def find_item_by_barcode(items, barcode):
    for item in items:
        if item.get('order_item_collection_barcode') == barcode:
            return (True, item)
    return (False, {})

@role_required(allowed_roles=['super admin'])
def exportOrderToCsv(request):
    order_id = int(request.GET.get('order_id'))
    
    order_track_obj = OrderTrack.objects.filter(order_id = order_id).first()
    
    order_item_response_list = []
    order_track_response = {}
    card_item_response_list = []
    global_dict = {}
    global_dict["order_id"] = order_id
    global_dict['OrderData'] = get_translation('create new order')
    if order_track_obj:
        order_track_response = model_to_dict(order_track_obj)
        order_track_response['created_at'] = order_track_obj.created_at
        
        order_track_response['client_order_id'] = order_track_obj.client_order_id
        
        user_info_queryset = EliteNovaUser.objects.filter(id = order_track_response['user']).first()
        user_info_obj = model_to_dict(user_info_queryset)
        order_item_object = OrderItems.objects.filter(order_track_id = order_track_response['order_track_id'])
        order_track_response['company_name'] = user_info_obj['company_name'] 
        order_track_response['employee_name'] = user_info_obj['employee_name']
        order_track_response['employee_last_name'] = user_info_obj['employee_last_name']
        order_track_response['order_decision_tracker_bool'] = True if order_track_response['order_decision_tracker'] == 'yes' else False
        order_track_response['order_decision_tracker'] = global_dict['OrderData'][order_track_response['order_decision_tracker']]
        
        global_dict['order_track_response'] = order_track_response
        # print("order_track_response",global_dict['order_track_response'])
        global_dict['order_item_response_list'] =  [model_to_dict(item) for item in order_item_object] # collections data
        # print(global_dict['order_item_response_list'])
        for item in global_dict['order_item_response_list']:
            if item['order_item_keepflow']!='':
                item['order_item_keepflow'] = global_dict['OrderData'][item['order_item_keepflow']]
        global_dict['order_item_response_list_length'] = len(global_dict['order_item_response_list'])

        card_item_object = Cards.objects.filter(order_track_id = order_track_response['order_track_id'])
        card_item_response_list = [model_to_dict(item) for item in card_item_object]
        card = []
        
        have_drawer,have_clap,have_hinge  = 0,0,0
        for index, card_item_response in enumerate (card_item_response_list, 1):
            # print(index,card_item_response)
            dic = dict()
            drawer_item_response_list = []
            clap_item_response_list = []
            hinge_item_response_list = []
            # print(index, bool(card_item_response['have_drawer']))
            if bool(card_item_response['have_drawer']) is True:
                
                drawer_items_queryset = DrawarOrder.objects.filter(
                    order_track__order_id=order_id
                ).values_list('drawar_order_id', flat=True)
                
                list_ =  [drawar_order_id for drawar_order_id in drawer_items_queryset][have_drawer]
                query = DrawarOrder.objects.filter(
                    drawar_order_id = list_
                )
                drawer_item_response_list = [model_to_dict(k) for k in query]
                # drawer_item_response_list = [drawer_item_response_list]
                have_drawer += 1
            
            
            if card_item_response['have_clap'] is True:
                clap_item_queryset = ClapOrder.objects.filter(
                    order_track__order_id=order_id
                ).values_list('clap_order_id', flat=True)
                list_ =  [clap_order_id for clap_order_id in clap_item_queryset][have_clap]
                query = ClapOrder.objects.filter(
                    clap_order_id = list_
                )
                clap_item_response_list = [model_to_dict(k) for k in query]
                have_clap += 1

            if card_item_response['have_hinge'] is True:
                hinge_item_queryset = HingeOrder.objects.filter(
                     order_track__order_id=order_id
                ).values_list('hinge_order_id', flat=True)
                list_ =  [hinge_order_id for hinge_order_id in hinge_item_queryset][have_hinge]
                query = HingeOrder.objects.filter(
                    hinge_order_id = list_
                )
                hinge_item_response_list = [model_to_dict(k) for k in query]
                have_hinge += 1
           
            dic[f'card_drawer'], dic[f'card_drawer_length'] =  drawer_item_response_list,len(drawer_item_response_list)
            dic[f'card_clap'], dic[f'card_clap_length'] = clap_item_response_list, len(clap_item_response_list)
            dic[f'card_hinge'], dic[f'card_hinge_length'] = hinge_item_response_list, len(hinge_item_response_list)
            dic['knob_model'] = ''
            
            if card_item_response['knob'] !='' and card_item_response['knob'] is not None and len(card_item_response['knob'])!=0:
                query_knob = Knob.objects.filter(knob_id = card_item_response['knob']).first()
                query_knob_dict = model_to_dict(query_knob)
                
                dic['knob_model'] = query_knob_dict['knob_model']
            dic['knob_family_bool'] = False
            dic['knob_family'] = ''
            dic['knob_color'] = ''

            if card_item_response['knob'] != global_dict['OrderData']['without knob']:
                
                knob_queryset = Knob.objects.filter(knob_model = card_item_response['knob']).first()
                if knob_queryset is not None:
                    knob_dict = model_to_dict(knob_queryset)
                    dic['knob_family'] = knob_dict['knob_family']
                    dic['knob_family_bool'] = True
                    dic['knob_color'] = knob_dict["color"]
                
            dic['helper_value_english'] = ''
            dic['helper_value_hebrew'] = ''

            if len(card_item_response['knob_position_id']) > 0:
                helper_queryset = helperTables.objects.filter(helper_table_id = card_item_response['knob_position_id']).first()
                helper_dict = model_to_dict(helper_queryset)
                dic['helper_value_english'] = helper_dict['helper_value_english']
                dic['helper_value_hebrew'] = helper_dict['helper_value_hebrew']
            
            card_item_response['collection_barcode'] = ''
            card_item_response['kant']  = ''
            card_item_response ['min_order'] = ''
            card_item_response['back'] = ''
            if card_item_response['collection_barcode_id']!='':
                collection_queryset = Collection.objects.filter(collection_id = card_item_response['collection_barcode_id']).first()
                collection_obj = model_to_dict(collection_queryset)
                card_item_response['collection_barcode'] =  collection_obj['collection_barcode']
                card_item_response['kant'] =  collection_obj['kant']
                card_item_response ['min_order'] =  collection_obj['min_order']
                card_item_response['back'] = collection_obj['back']
            card.append({**dic, **card_item_response})
        global_dict['cards'] = card
    order_trans = global_dict['OrderData']
    order_decision_tracker_bool = order_track_response['order_decision_tracker_bool']
    final_list = []
    keys = [
        "PartRef", "Materiael", "GraiDirection", "PartL", "PartW", "Qty", 
        "PartEdge1", "PartEdge2", "PartEdge3", "PartEdge4", "PartExt01", 
        "PartDrawing", "PartFRef", "PartFExt01", "PartFExt02", "PartFExt03", 
        "PartFExt04", "PartFExt05", "PartFExt06", "PartFExt07", "PartFExt08", 
        "PartFExt09", "PartFExt10", "PartFExt11", "PartFExt12"
    ]
    # print(global_dict['cards'])
    # print("Here")
    # print(order_decision_tracker_bool)
    if order_decision_tracker_bool == False:
        for card in global_dict['cards']:
            # print(card)

            sum_ = 0
            sum_ += card['card_drawer_length']
            sum_ += card['card_clap_length']
            sum_ += card['card_hinge_length']

            temp_dict = {key:'' for key in keys}
            temp_dict['PartRef'] = card["card_notes"]
            temp_dict['Materiael'] = global_dict['order_item_response_list'][0]['order_item_collection_barcode']
            temp_dict["GraiDirection"] = ""
            if (order_trans['keep_flow_height'] == global_dict['order_item_response_list'][0]['order_item_texture']):
                #temp_dict["GraiDirection"] = "L"
                temp_dict["GraiDirection"] = "1"
            elif(order_trans['keep_flow_width'] == global_dict['order_item_response_list'][0]['order_item_texture']):
                #temp_dict["GraiDirection"] = "W"
                temp_dict["GraiDirection"] = "2"
            # print("order_item_collection_barcode=",global_dict['order_item_response_list'][0]['order_item_collection_barcode'])
            collection_queryset = Collection.objects.filter(collection_barcode=global_dict['order_item_response_list'][0]['order_item_collection_barcode']).first()
            c_dic = model_to_dict(collection_queryset)
            temp_dict["PartL"] = card["card_height"]
            temp_dict["PartW"] = card["card_width"]
            temp_dict["Qty"] = card["card_quantity"]
            temp_dict["PartEdge1"] = card["knob_model"] if card["helper_value_english"] == "width right" else c_dic["kant_code"]
            temp_dict["PartEdge2"] = card["knob_model"] if card["helper_value_english"] == "width left" else c_dic["kant_code"]
            temp_dict["PartEdge3"] = card["knob_model"] if card["helper_value_english"] == "lower" else c_dic["kant_code"]
            temp_dict["PartEdge4"] = card["knob_model"] if card["helper_value_english"] == "upper" else c_dic["kant_code"]
            temp_dict["PartExt01"] = ''
            
            drawer_systems = {
                "לגרבוקס כל המגירות החיצוניות": "legrabox",
                "מריוובוקס כל המגירות החיצוניות": "merivobox",
                "אנטרו מגירות": "antaro",
                "אטירטק": "atiratech",
                "אוונטק": "Ontech",
                "NP SCALA": "NPSCALA",
                "NP": "NP",
                "מגירות ויזיון": "vision",
                "מגירות ויזיון סופרים": "visionS"
            }
            hinge_system = {
                "בלום": "hingblumdtc",
                "הטיש": "hinghettich"
            }
            if sum_ != 0:
                val__ = 'empty'
                if card['card_drawer_length'] == 1:
                    temp_dict["PartDrawing"] = f"Type_{drawer_systems[card['card_drawer'][0]['drawar_order_type']]}{card['card_drawer'][0]['drawar_order_code']}=1 lo={card['card_drawer'][0]['drawar_order_lo']} ro={card['card_drawer'][0]['drawar_order_ro']} bo={card['card_drawer'][0]['drawar_order_bo']}"
                elif card['card_hinge_length'] == 1: #hinge_order_yp
                    temp_mapping = {order_trans['dty_option1']:1, order_trans['dty_option2']:2}

                    li_ = [card['card_hinge'][0]['hinge_order_xp1'], card['card_hinge'][0]['hinge_order_xp2'], card['card_hinge'][0]['hinge_order_xp3'], card['card_hinge'][0]['hinge_order_xp4'], card['card_hinge'][0]['hinge_order_xp5'], card['card_hinge'][0]['hinge_order_xp6']]
                    values_list = [value for value in li_ if value]
                    nh_ = len(values_list)
                    
                    str___ = ' '.join([f"xp{i}={val}" for i, val in enumerate (values_list,1)])
                    hinge_order_door_opening_side_ = "2" if card['card_hinge'][0]['hinge_order_door_opening_side'] == "ימין" else "1"
                    temp_dict["PartDrawing"] = f"Type_{hinge_system[card['card_hinge'][0]['hinge_order_provider']]}=1 nh={nh_} yp={card['card_hinge'][0]['hinge_order_yp']} {str___} dty={temp_mapping[card['card_hinge'][0]['hinge_order_dty']]} flip={hinge_order_door_opening_side_}"
                
                elif card['card_clap_length'] == 1:
                    temp_dict["PartDrawing"] = f"Type_blum{card['card_clap'][0]['clap_claps_pr']}=1 lo={card['card_clap'][0]['clap_order_lo']} ro={card['card_clap'][0]['clap_order_ro']} to={card['card_clap'][0]['clap_order_bo']}"
            
            if global_dict['order_item_response_list'][0]['order_item_collection_barcode'] != '':
                multiplier_check = round(float( card['card_width']),1) * round (float(card['card_height']),1)
                
                min_order_of_collection = float(c_dic['min_order'])
                multiplier_check = multiplier_check/1000000
                if multiplier_check >  min_order_of_collection:
                    value =  float(multiplier_check) * float(card['card_quantity'])
                    temp_dict["PartExt01"] = value
                else:
                    temp_dict["PartExt01"] =  float(min_order_of_collection) * float(card['card_quantity'])


            temp_dict['PartFRef'] = global_dict['order_id']
            temp_dict['PartFExt01'] = global_dict["order_track_response"]["client_order_id"]
            temp_dict['PartFExt02'] = global_dict['order_track_response']["employee_name"]+" "+global_dict["order_track_response"]["employee_last_name"]
            temp_dict['PartFExt03'] = "" if not global_dict["order_track_response"]["client_order_name"] else global_dict["order_track_response"]["client_order_name"] 
            temp_dict['PartFExt04'] =  c_dic["min_order"]
            temp_dict['PartFExt05'] =  c_dic["back"]
            temp_dict['PartFExt06'] =  ""
            temp_dict['PartFExt07'] = c_dic["kant"]
            temp_dict['PartFExt08'] = card["knob_model"]
            temp_dict['PartFExt09'] = global_dict['order_item_response_list'][0]['order_item_collection_barcode']
            temp_dict['PartFExt10'] = global_dict['order_item_response_list'][0]['order_item_knobcolor']
            temp_dict['PartFExt11'] ='תואם קבוע'
            temp_dict['PartFExt12'] = temp_dict["GraiDirection"]
            final_list.append(temp_dict)
    else:
        # print(global_dict['order_item_response_list'])
        # count = 0
        for card in global_dict['cards']:
            sum_ = 0
            # count += 1
            # print("count=",count)
            #print(card)

            sum_ += card['card_drawer_length']
            sum_ += card['card_clap_length']
            sum_ += card['card_hinge_length']

            temp_dict = {key:'' for key in keys}
            temp_dict['PartRef'] = card["card_notes"]
            temp_dict['Materiael'] = card["collection_barcode"]
            collection_queryset = Collection.objects.filter(collection_barcode=card["collection_barcode"]).first()
            c_dic = model_to_dict(collection_queryset)
            found, item = find_item_by_barcode(global_dict['order_item_response_list'], card["collection_barcode"])
            # print(item)
            temp_dict["GraiDirection"] = ""

            if found:
                card["knob_color"] = "" if item['order_item_knobcolor'] ==  "טבעי" else item['order_item_knobcolor']
                # if item['order_item_knobfamily']=='':
                #     card["knob_color"] = ""
                if card["knob"] == "":
                    card["knob_color"] = ""
                
                if item['order_item_keepflow'] == order_trans['yes']: # if keep flow is yes
                    if (order_trans['keep_flow_height'] == item['order_item_texture']):
                        #temp_dict["GraiDirection"] = "L"
                        temp_dict["GraiDirection"] = "1"
                    elif(order_trans['keep_flow_width'] == item['order_item_texture']):
                        #.temp_dict["GraiDirection"] = "W"
                        temp_dict["GraiDirection"] = "2"
            
            temp_dict["PartL"] = card["card_height"]
            temp_dict["PartW"] = card["card_width"]
            temp_dict["Qty"] = card["card_quantity"]
            

            temp_dict["PartEdge1"] = card["knob_model"] if card["helper_value_english"] == "width right" else c_dic["kant_code"]
            temp_dict["PartEdge2"] = card["knob_model"] if card["helper_value_english"] == "width left" else c_dic["kant_code"]
            temp_dict["PartEdge3"] = card["knob_model"] if card["helper_value_english"] == "lower" else c_dic["kant_code"]
            temp_dict["PartEdge4"] = card["knob_model"] if card["helper_value_english"] == "upper" else c_dic["kant_code"]
            #אוונטק
            drawer_systems = {
                "לגרבוקס כל המגירות החיצוניות": "legrabox",
                "מריוובוקס כל המגירות החיצוניות": "merivobox",
                "אנטרו מגירות": "antaro",
                "אטירטק": "atiratech",
                "אוונטק": "Ontech",
                "NP SCALA": "NPSCALA",
                "NP": "NP",
                "מגירות ויזיון": "vision",
                "מגירות ויזיון סופרים": "visionS"
            }
            hinge_system = {
                "בלום": "hingblumdtc",
                "הטיש": "hinghettich"
            }
            if sum_ != 0:
                if card['card_drawer_length'] == 1:
                    temp_dict["PartDrawing"] = f"Type_{drawer_systems[card['card_drawer'][0]['drawar_order_type']]}{card['card_drawer'][0]['drawar_order_code']}=1 lo={card['card_drawer'][0]['drawar_order_lo']} ro={card['card_drawer'][0]['drawar_order_ro']} bo={card['card_drawer'][0]['drawar_order_bo']}"
                elif card['card_hinge_length'] == 1: #hinge_order_yp
                    temp_mapping = {order_trans['dty_option1']:1, order_trans['dty_option2']:2}
                    li_ = [card['card_hinge'][0]['hinge_order_xp1'], card['card_hinge'][0]['hinge_order_xp2'], card['card_hinge'][0]['hinge_order_xp3'], card['card_hinge'][0]['hinge_order_xp4'], card['card_hinge'][0]['hinge_order_xp5'], card['card_hinge'][0]['hinge_order_xp6']]
                    values_list = [value for value in li_ if value]
                    nh_ = len(values_list)
                    str___ = ' '.join([f"xp{i}={val}" for i, val in enumerate (values_list,1)])
                    hinge_order_door_opening_side_ = "2" if card['card_hinge'][0]['hinge_order_door_opening_side'] == "ימין" else "1"
                    temp_dict["PartDrawing"] = f"Type_{hinge_system[card['card_hinge'][0]['hinge_order_provider']]}=1 nh={nh_} yp={card['card_hinge'][0]['hinge_order_yp']} {str___} dty={temp_mapping[card['card_hinge'][0]['hinge_order_dty']]} flip={hinge_order_door_opening_side_}"
                elif card['card_clap_length'] == 1:
                    temp_dict["PartDrawing"] = f"Type_blum{card['card_clap'][0]['clap_claps_pr']}=1 lo={card['card_clap'][0]['clap_order_lo']} ro={card['card_clap'][0]['clap_order_ro']} to={card['card_clap'][0]['clap_order_bo']}"

            collection_queryset = Collection.objects.filter(collection_barcode = card['collection_barcode']).first()
            c_dic = model_to_dict(collection_queryset)
            
            # val = (float(card["card_width"]) * float(card["card_height"])) / 1000000
            # if val <= float(c_dic["min_order"]):
            #     temp_dict["PartExt01"] = float(c_dic["min_order"]) * float(card["card_quantity"])
            
            # multiplier_check = round(float( card['card_width']),1) * round (float(card['card_height']),1)

            # min_order_of_collection = float(c_dic['min_order'])
            # multiplier_check = multiplier_check/1000000
            # if multiplier_check <=  min_order_of_collection:
            #     temp_dict["PartExt01"] = float(c_dic["min_order"]) * float(card["card_quantity"])

            multiplier_check = round(float( card['card_width']),1) * round (float(card['card_height']),1)
                
            min_order_of_collection = float(c_dic['min_order'])
            multiplier_check = multiplier_check/1000000
            if multiplier_check >  min_order_of_collection:
                value =  float(multiplier_check) * float(card['card_quantity'])
                temp_dict["PartExt01"] = value
            else:
                temp_dict["PartExt01"] =  float(min_order_of_collection) * float(card['card_quantity'])

            temp_dict['PartFRef'] = global_dict['order_id']
            temp_dict['PartFExt01'] = global_dict["order_track_response"]["client_order_id"]
            temp_dict['PartFExt02'] = global_dict['order_track_response']["employee_name"]+" "+global_dict["order_track_response"]["employee_last_name"]
            temp_dict['PartFExt03'] = "" if not global_dict["order_track_response"]["client_order_name"] else global_dict["order_track_response"]["client_order_name"] 
            temp_dict['PartFExt04'] =  c_dic["min_order"]
            temp_dict['PartFExt05'] =  c_dic["back"]
            temp_dict['PartFExt06'] =  ""
            temp_dict['PartFExt07'] = c_dic["kant"]
            temp_dict['PartFExt08'] = card["knob_model"]
            temp_dict['PartFExt09'] = card['collection_barcode']
            temp_dict['PartFExt10'] = card["knob_color"]
            temp_dict['PartFExt11'] ='תואם קבוע'
            temp_dict['PartFExt12'] = temp_dict["GraiDirection"]
            final_list.append(temp_dict)
    
    return render (request, 'super_admin/generate_order_csv.html', context = {'rows':final_list,'order_id':global_dict['order_id']})



@role_required(allowed_roles=['super admin'])
def downloadOrderImage(request):
    order_track_id = int(request.GET.get('order_track_id'))
    
    # Fetch the order track
    order_item = OrderItems.objects.filter(order_track_id=order_track_id).first()
    if not order_item or not order_item.order_item_uploaded_img:
        return order_that_sent_to_factory(request)
    
    # Get the file path
    absolute_image_path = order_item.order_item_uploaded_img.path  # Use the .path attribute to get the file path

    if not os.path.exists(absolute_image_path):
        return order_that_sent_to_factory(request)
    
    # Determine the MIME type based on the file extension
    mime_type, _ = mimetypes.guess_type(absolute_image_path)
    if mime_type is None:
        mime_type = "application/octet-stream"  # Fallback for unknown types
    
    # Serve the file
    with open(absolute_image_path, "rb") as img_file:
        response = HttpResponse(img_file.read(), content_type=mime_type)
        response["Content-Disposition"] = f'attachment; filename="{os.path.basename(absolute_image_path)}"'
        return response
    


@role_required(allowed_roles=['super admin'])
def markOrderAsComplete(request):
    order_track_id = int(request.GET.get('order_track_id'))
    
    # Fetch the order track
    # order_item = OrderItems.objects.filter(order_track_id=order_track_id).first()
    # order_item.status = "Completed"