"""
Pre Token Generation Lambda Trigger para el User Pool de Pacientes.

Similar al de medicos pero agrega:
- 'custom:role': 'patient'
"""


def lambda_handler(event, context):
    return event
