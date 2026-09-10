/* Set ONE destination before launch. No data is stored or sent without configuration.
 * endpoint: HTTPS endpoint accepting JSON and returning a successful 2xx response.
 * whatsapp: international phone digits, without '+' (opens a message for the visitor to send).
 * email: receiving email address (opens the visitor's email client).
 */
window.NORD_ORDER_CONFIG=Object.assign({endpoint:'',whatsapp:'',email:''},window.NORD_ORDER_CONFIG||{});
(()=>{
 const form=document.getElementById('orderForm'),qty=document.getElementById('quantity'),status=document.getElementById('formStatus'),button=document.getElementById('submitOrder');
 function setQuantity(delta){qty.value=Math.max(1,Math.min(100000,(Number(qty.value)||1)+delta));qty.dispatchEvent(new Event('input',{bubbles:true}));}
 document.getElementById('less').onclick=()=>setQuantity(-1);document.getElementById('more').onclick=()=>setQuantity(1);
 form.addEventListener('input',()=>{status.textContent='';});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form));data.quantity=Number(data.quantity);data.drop='006';data.product='NORD Chocolate — 470 ml';
  if(!Number.isInteger(data.quantity)||data.quantity<1){qty.setCustomValidity('Indica una cantidad entera de al menos un bote.');qty.reportValidity();return;}qty.setCustomValidity('');
  const config=window.NORD_ORDER_CONFIG;
  const message=`DROP 006 / Solicitud de apartado\n\nNombre: ${data.name}\nCorreo: ${data.email}\nWhatsApp: ${data.phone}\nCiudad: ${data.city}\nCantidad: ${data.quantity} botes\nProducto: ${data.product}`;
  if(config.endpoint){button.disabled=true;button.textContent='Enviando…';try{const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('submit');status.textContent='Recibimos tu solicitud. Te contactaremos para confirmar disponibilidad y los siguientes pasos.';form.reset();}catch(error){status.textContent='No pudimos enviar tu solicitud. Tus datos siguen aquí; intenta de nuevo.';}finally{button.disabled=false;button.innerHTML='Apartar mi orden <span aria-hidden="true">↗</span>';}}
  else if(config.whatsapp){const digits=config.whatsapp.replace(/\D/g,'');window.open('https://wa.me/'+digits+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');status.textContent='Envía el mensaje en WhatsApp para completar tu solicitud.';}
  else if(config.email){location.href='mailto:'+encodeURIComponent(config.email)+'?subject='+encodeURIComponent('NORD / Drop 006 / Solicitud de apartado')+'&body='+encodeURIComponent(message);status.textContent='Envía el correo que se abrió para completar tu solicitud.';}
  else{status.textContent='El envío de solicitudes todavía no está habilitado. Tus datos no se han enviado.';}
 });
 qty.addEventListener('input',()=>qty.setCustomValidity(''));
})();
