from flask import Flask, request, jsonify
from flask_cors import CORS
# Importar librerias de tensorflow y keras especificas como en el ejemplo
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import time # Importar time si se usa para algo más que logs
import base64
import os # Importar os para manejar rutas de archivo

app = Flask(__name__)
CORS(app)

# Tipos de emociones del detector
classes = ['angry','disgust','fear','happy','neutral','sad','surprise']

# Cargamos el  modelo de detección de rostros
prototxtPath = r"face_detector/deploy.prototxt"
weightsPath = r"face_detector/res10_300x300_ssd_iter_140000.caffemodel"
faceNet = cv2.dnn.readNet(prototxtPath, weightsPath)

# Carga el detector de clasificación de emociones
emotionModel = load_model("modelFEC.h5")

# La lógica de predict_emotion adaptada para el backend
def process_image_for_emotion(frame, faceNet, emotionModel):
    # Construye un blob de la imagen para el detector de rostros
    # El ejemplo usa 224x224 para el blob del detector de rostros
    blob = cv2.dnn.blobFromImage(frame, 1.0, (224, 224), (104.0, 177.0, 123.0))

    # Realiza las detecciones de rostros
    faceNet.setInput(blob)
    detections = faceNet.forward()

    emotion_results = []
	
    # Recorre cada una de las detecciones
    for i in range(0, detections.shape[2]):
        # Fija un umbral de confianza (usando 0.3 como en el ejemplo)
        confidence = detections[0, 0, i, 2]

        if confidence > 0.3: # Usando el umbral más bajo que probamos
            # Toma el bounding box escalado
            (h, w) = frame.shape[:2]
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (Xi, Yi, Xf, Yf) = box.astype("int")

            # Valida las dimensiones
            if Xi < 0: Xi = 0
            if Yi < 0: Yi = 0
            if Xf > w: Xf = w
            if Yf > h: Yf = h

            # Extrae el rostro
            face = frame[Yi:Yf, Xi:Xf]

            # Asegurarse de que la región del rostro no esté vacía
            if face.shape[0] == 0 or face.shape[1] == 0:
                continue 

            # Se convierte BGR a GRAY y se escala a 48x48 como en el ejemplo
            face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
            face = cv2.resize(face, (48, 48))
            
            # Preparar el array para el modelo de emociones usando img_to_array y expand_dims
            face2 = img_to_array(face)
            face2 = np.expand_dims(face2,axis=0)

            # Realizar la predicción de emociones
            pred = emotionModel.predict(face2)
            
            # Procesar la predicción para obtener confianza y resultados por clase
            predicted_class = np.argmax(pred[0])
            confidence = float(pred[0][predicted_class]) # Confianza de la emoción predicha

            # Guardar el resultado para este rostro
            emotion_results.append({
                'box': [int(Xi), int(Yi), int(Xf), int(Yf)], # Coordenadas del bounding box (opcional en frontend)
                'emotion': classes[predicted_class],
                'confidence': confidence,
                'all_predictions': {
                    class_name: float(p) 
                    for class_name, p in zip(classes, pred[0])
                }
            })

    return emotion_results

@app.route('/predict', methods=['POST'])
def predict():
    # start_time = time.time() # Deshabilitado temporalmente para simplificar logs
    try:
        data = request.json
        image_data = data['image']
        
        # Decodificar la imagen base64 usando OpenCV
        image_bytes = base64.b64decode(image_data.split(',')[1])
        np_arr = np.frombuffer(image_bytes, np.uint8)
        # Cargar como imagen a color para el detector de rostros (el ejemplo original usa frame de cam.read() que es BGR)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR) 

        if frame is None:
            print("Error: No se pudo decodificar la imagen.")
            return jsonify({'error': 'No se pudo decodificar la imagen'}), 400

        # --- Inicio: Guardar imagen recibida para depuración ---
        # Puedes cambiar la ruta y nombre del archivo según necesites
        # Considera guardar solo algunas imágenes para evitar llenar el disco
        # Ejemplo: Guardar una imagen cada 100 peticiones, o añadir un timestamp al nombre
        # Para esta prueba, guardaremos la primera imagen recibida después de iniciar el backend
        # if not hasattr(predict, 'image_saved'):
        #    image_save_path = "received_image.jpg"
        #    cv2.imwrite(image_save_path, frame)
        #    print(f"Imagen recibida guardada en: {image_save_path}")
        #    predict.image_saved = True
        # Para guardar cada imagen, puedes usar un timestamp en el nombre:
        timestamp = int(time.time() * 1000)
        image_save_path = os.path.join("received_images", f"frame_{timestamp}.jpg")
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(image_save_path), exist_ok=True)
        cv2.imwrite(image_save_path, frame)
        # --- Fin: Guardar imagen recibida para depuración ---

        # Procesar la imagen y obtener resultados de emociones
        emotion_results = process_image_for_emotion(frame, faceNet, emotionModel)
        
        # end_time = time.time() # Deshabilitado temporalmente
        # print(f"Procesamiento completado en {end_time - start_time:.4f} segundos. Rostros detectados (con confianza > 0.3): {len(emotion_results)}") 
        # Logs de resultados son manejados por el frontend, pero si quieres verlos aquí:
        # print(f"Resultados de emoción: {emotion_results}")
        
        return jsonify(emotion_results)

    except Exception as e:
        print(f"Error en el backend: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 