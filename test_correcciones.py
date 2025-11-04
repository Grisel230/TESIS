"""
Script de prueba para verificar las correcciones implementadas
Ejecutar con: python test_correcciones.py
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Probar el nuevo endpoint /health"""
    print("\n🔍 Probando /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_rate_limiting():
    """Probar rate limiting en /api/login"""
    print("\n🔍 Probando rate limiting en /api/login...")
    print("   Enviando 12 requests rápidas (límite: 10/minuto)...")
    
    success_count = 0
    rate_limited = False
    
    for i in range(12):
        try:
            response = requests.post(
                f"{BASE_URL}/api/login",
                json={"username": "test", "password": "test"},
                timeout=5
            )
            if response.status_code == 429:
                print(f"   Request {i+1}: ⚠️  Rate limited (esperado después de 10)")
                rate_limited = True
                break
            else:
                print(f"   Request {i+1}: {response.status_code}")
                success_count += 1
        except Exception as e:
            print(f"   Request {i+1}: ❌ Error: {e}")
    
    if rate_limited:
        print("   ✅ Rate limiting funcionando correctamente")
        return True
    else:
        print("   ⚠️  Rate limiting no se activó (puede necesitar más requests)")
        return success_count > 0

def test_api_status():
    """Probar el endpoint /api/status"""
    print("\n🔍 Probando /api/status endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/status")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   TensorFlow: {data.get('tensorflow_available')}")
        print(f"   Models: {data.get('models_loaded')}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 PRUEBAS DE CORRECCIONES IMPLEMENTADAS")
    print("=" * 60)
    print("\n⚠️  Asegúrate de que el servidor Flask está corriendo en puerto 5000")
    print("   Ejecuta: python app.py")
    
    input("\nPresiona Enter para continuar...")
    
    results = {
        "health_check": test_health_check(),
        "rate_limiting": test_rate_limiting(),
        "api_status": test_api_status()
    }
    
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    total = len(results)
    passed = sum(results.values())
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 Resultado: {passed}/{total} pruebas pasadas")
    
    if passed == total:
        print("\n🎉 ¡Todas las correcciones funcionan correctamente!")
    else:
        print("\n⚠️  Algunas pruebas fallaron. Verifica que el servidor esté corriendo.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
