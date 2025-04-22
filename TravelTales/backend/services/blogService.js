// backend/services/blogService.js
export async function activarBlog(viajeId, viajesRef) {
    const snap = await viajesRef.child(viajeId).once('value');
    if (!snap.exists()) throw new Error('Viaje no encontrado');
    await viajesRef.child(viajeId).update({ blog: true });
    return { mensaje: 'Se ha creado el blog del viaje.' };
  }
  