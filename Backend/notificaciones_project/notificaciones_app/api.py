from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from django.db import connection
from django.db.utils import DatabaseError
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime

class TestDatabaseConnection(APIView):
    def get(self, request):
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
            return Response({"message": "Conexión a la base de datos exitosa", "result": result[0]})
        except Exception as e:
            return Response({"message": "Error de conexión a la base de datos", "error": str(e)}, status=500)

class CustomObtainAuthToken(ObtainAuthToken):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

class TestAuthentication(APIView):
    def get(self, request):
        return Response({"message": "Autenticación exitosa", "user": request.user.username})

class Notificationentry(APIView):
    def post(self, request):
        try:
            notification = request.data[0] if isinstance(request.data, list) else request.data
            
            # Procesar la entidad emisora
            issuing_entity = notification.get("entidad_emisora")
            if not issuing_entity:
                return Response({"message": "entidad_emisora es requerida"}, status=status.HTTP_400_BAD_REQUEST)

            issuing_entity_id = process_entity(issuing_entity)
            if isinstance(issuing_entity_id, dict) and issuing_entity_id.get("error"):
                return Response(issuing_entity_id, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            notification["entidad_emisora"] = {"id": issuing_entity_id, "nombre": (issuing_entity.get("nombre", "") if isinstance(issuing_entity, dict) else issuing_entity)}

            # Procesar el recepcionista
            recepcionista = notification.get("recepcionista")
            if recepcionista:
                recepcionista_id = process_person(recepcionista)
                if isinstance(recepcionista_id, dict) and recepcionista_id.get("error"):
                    return Response(recepcionista_id, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                notification["recepcionista"] = {"id": recepcionista_id, "nombre": recepcionista}

            # Procesar el colaborador de entrega (si existe)
            colaborador_entrega = notification.get("colaborador_entrega")
            if colaborador_entrega:
                colaborador_id = process_person(colaborador_entrega)
                if isinstance(colaborador_id, dict) and colaborador_id.get("error"):
                    return Response(colaborador_id, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                notification["colaborador_entrega"] = {"id": colaborador_id, "nombre": colaborador_entrega}

            # Insertar la notificación
            
            result = NotificationInsert(notification)
            if result.get("error"):
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "Notificación creada", "notification": result}, status=status.HTTP_201_CREATED)

        except DatabaseError as e:
            return Response({"message": "Error de base de datos", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"message": "Error inesperado", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Notificationdelivery(APIView):
    def post(self, request):
        try:
            notification = request.data[0] if isinstance(request.data, list) else request.data
        
            notification_id = notification.get('id')
            if not notification_id:
                return Response({"message": "Se requiere el ID de la notificación"}, status=status.HTTP_400_BAD_REQUEST)

            colaborador_entrega = notification.get("colaborador_entrega")
            if colaborador_entrega:
                colaborador_id = process_person(colaborador_entrega)
                if isinstance(colaborador_id, dict) and colaborador_id.get("error"):
                    return Response(colaborador_id, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                notification["colaborador_entrega"] = {"id": colaborador_id, "nombre": colaborador_entrega}

            result = NotificationUpdate(notification)
            if result.get("error"):
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            send_notification_email(notification_id)

            return Response({"message": "Notificación actualizada y correo enviado", "notification": result}, status=status.HTTP_200_OK)

        except DatabaseError as e:
            return Response({"message": "Error de base de datos", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"message": "Error inesperado", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#------------------------------------------------------------------------
def NotificationUpdate(notification_data):
    try:
        with connection.cursor() as cursor:
            query = f'''
            UPDATE Notificacion
            SET hora_entrega_interna = '{notification_data.get('hora_entrega_interna')}',
                colaborador_entrega_id = '{notification_data.get('colaborador_entrega').get('id')}',
                fecha_hora_entrega = '{notification_data.get('fecha_hora_entrega')}'
            WHERE id = {notification_data['id']}
            '''

            cursor.execute(query)
            
            if cursor.rowcount == 0:
                return {
                    "error": True,
                    "message": f"No se encontró una notificación con el ID {notification_data['id']}"
                }
            
            return {
                "message": "Notificación actualizada correctamente",
                "id": notification_data['id']
            }
    except DatabaseError as e:
        return {
            "error": True,
            "message": f"Error al actualizar la notificación: {str(e)}"
        }
    except Exception as e:
        return {
            "error": True,
            "message": f"Error inesperado: {str(e)}"
        }

def process_entity(entity):
    if isinstance(entity, dict) and "id" in entity:
        return entity["id"]
    
    entity_name = entity["nombre"] if isinstance(entity, dict) else entity
    with connection.cursor() as cursor:
        cursor.execute('SELECT id FROM Entidad WHERE nombre = %s', [entity_name])
        result = cursor.fetchone()
    
    if result:
        return result[0]
    else:
        return EntityInsert(entity)["id"]

def process_person(full_name):
    # Dividir el nombre completo en nombre y apellido
    name_parts = full_name.split(maxsplit=1)
    nombre = name_parts[0]
    apellido = name_parts[1] if len(name_parts) > 1 else ''

    with connection.cursor() as cursor:
        cursor.execute('SELECT id FROM Persona WHERE nombre = %s AND apellido = %s', [nombre, apellido])
        result = cursor.fetchone()
    
    if result:
        return result[0]
    else:
        return PersonInsert({"nombre": nombre, "apellido": apellido})["id"]

def EntityInsert(Entity):
    try:
        with connection.cursor() as cursor:
            if isinstance(Entity, dict):
                cursor.execute('''
                    INSERT INTO Entidad (nombre, tipo, direccion, telefono, email)
                    OUTPUT INSERTED.ID 
                    VALUES (%s, %s, %s, %s, %s)
                ''', (
                    Entity.get('nombre', ''),
                    Entity.get('tipo', ''),
                    Entity.get('direccion', ''),
                    Entity.get('telefono', ''),
                    Entity.get('email', '')
                ))
            else:
                cursor.execute('INSERT INTO Entidad (nombre) OUTPUT INSERTED.ID VALUES (%s)', [Entity])

            inserted_id = cursor.fetchone()[0]
            
            return {
                "message": "Entidad insertada correctamente",
                "id": inserted_id
            }
    except DatabaseError as e:
        return {
            "error": True,
            "message": f"Error al insertar la entidad: {str(e)}"
        }
    except Exception as e:
        return {
            "error": True,
            "message": f"Error inesperado: {str(e)}"
        }

def PersonInsert(Person):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                INSERT INTO Persona (nombre, apellido, tipo, direccion, telefono, email) 
                OUTPUT INSERTED.ID
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                Person.get('nombre', ''),
                Person.get('apellido', ''),
                Person.get('tipo', ''),
                Person.get('direccion', ''),
                Person.get('telefono', ''),
                Person.get('email', '')
            ))

            inserted_id = cursor.fetchone()[0]
            
            return {
                "message": "Persona insertada correctamente",
                "id": inserted_id
            }
    except DatabaseError as e:
        return {
            "error": True,
            "message": f"Error al insertar la persona: {str(e)}"
        }
    except Exception as e:
        return {
            "error": True,
            "message": f"Error inesperado: {str(e)}"
        }

def NotificationInsert(notification_data):
    try:
        # Verificar que todos los campos requeridos estén presentes
        required_fields = ['fecha_recepcion', 'hora_recepcion', 'entidad_emisora', 'numero_cedula_expediente', 'dirigido_a', 'recepcionista']
        for field in required_fields:
            if field not in notification_data:
                return {
                    "error": True,
                    "message": f"Campo requerido faltante: {field}"
                }

        with connection.cursor() as cursor:
            cursor.execute('''
                INSERT INTO Notificacion (
                    fecha_recepcion, hora_recepcion, entidad_id,
                    numero_cedula_expediente, dirigido_a, recepcionista_id,
                    hora_entrega_interna, colaborador_entrega_id, fecha_hora_entrega
                )
                OUTPUT INSERTED.ID
                VALUES (
                    %s, %s, %s, %s, %s, %s, 
                    CASE WHEN %s = 'NULL' THEN NULL ELSE %s END,
                    CASE WHEN %s = 'NULL' THEN NULL ELSE %s END,
                    CASE WHEN %s = 'NULL' THEN NULL ELSE %s END
                );
            ''', (
                notification_data['fecha_recepcion'],
                notification_data['hora_recepcion'],
                notification_data['entidad_emisora']['id'],
                notification_data['numero_cedula_expediente'],
                notification_data['dirigido_a'],
                notification_data['recepcionista']['id'],
                notification_data.get('hora_entrega_interna') if notification_data.get('hora_entrega_interna') is not None  else 'NULL',
                notification_data.get('hora_entrega_interna') if notification_data.get('hora_entrega_interna') is not None  else 'NULL',
                notification_data.get('colaborador_entrega').get('id') if isinstance(notification_data.get('colaborador_entrega'), dict) else 'NULL',
                notification_data.get('colaborador_entrega').get('id') if isinstance(notification_data.get('colaborador_entrega'), dict) else 'NULL',
                notification_data.get('fecha_hora_entrega') if notification_data.get('fecha_hora_entrega') is not None else 'NULL',
                notification_data.get('fecha_hora_entrega') if notification_data.get('fecha_hora_entrega') is not None else 'NULL'
            ))
            
            inserted_id = cursor.fetchone()[0]
            
            return {
                "message": "Notificación insertada correctamente",
                "id": inserted_id
            }
    except DatabaseError as e:
        return {
            "error": True,
            "message": f"Error al insertar la notificación: {str(e)}"
        }
    except Exception as e:
        return {
            "error": True,
            "message": f"Error inesperado: {str(e)}"
        }

def send_notification_email(notification_id):
    subject = 'Notificación recibida'
    message = f'La notificación con ID {notification_id} ha sido recibida y procesada.'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ['ptoribio@consortiumlegal.com']
    
    try:
        send_mail(subject, message, from_email, recipient_list)
    except Exception as e:
        print(f"Error al enviar el correo: {str(e)}")



#logica general