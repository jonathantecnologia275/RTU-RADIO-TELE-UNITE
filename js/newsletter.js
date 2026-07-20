(function(){
  const SUPABASE_URL = 'https://dznqpltxfhpuorxxwypb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_GPyfox6GpwC1HK-fwchdEw_XdkKOhQ1';
  const sbn = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const T = {
    fr:{title:"Restez informé", desc:"Recevez les dernières nouvelles et mises à jour de RTU directement dans votre boîte mail.", placeholder:"Votre adresse email", btn:"S'abonner", success:"Merci ! Vous êtes maintenant abonné.", duplicate:"Cet email est déjà abonné.", error:"Une erreur est survenue. Réessayez."},
    ht:{title:"Rete enfòme", desc:"Resevwa dènye nouvèl ak mizajou RTU dirèkteman nan bwat imèl ou.", placeholder:"Adrès imèl ou", btn:"Enskri", success:"Mèsi! Ou enskri kounye a.", duplicate:"Imèl sa a deja enskri.", error:"Gen yon erè ki rive. Eseye ankò."},
    en:{title:"Stay informed", desc:"Get the latest RTU news and updates delivered to your inbox.", placeholder:"Your email address", btn:"Subscribe", success:"Thanks! You're now subscribed.", duplicate:"This email is already subscribed.", error:"Something went wrong. Please try again."},
    es:{title:"Mantente informado", desc:"Recibe las últimas noticias y actualizaciones de RTU en tu correo.", placeholder:"Tu correo electrónico", btn:"Suscribirse", success:"¡Gracias! Ya estás suscrito.", duplicate:"Este correo ya está suscrito.", error:"Ocurrió un error. Intenta de nuevo."},
    pt:{title:"Fique informado", desc:"Receba as últimas notícias e atualizações da RTU no seu email.", placeholder:"Seu email", btn:"Inscrever-se", success:"Obrigado! Você está inscrito.", duplicate:"Este email já está inscrito.", error:"Ocorreu um erro. Tente novamente."}
  };
  function lang(){ return localStorage.getItem('rtu_lang') || 'fr'; }

  function render(){
    const mount = document.getElementById('newsletter-mount');
    if(!mount) return;
    const d = T[lang()] || T.fr;
    mount.innerHTML = `
      <div class="newsletter-bar">
        <div class="nl-text">
          <h3>${d.title}</h3>
          <p>${d.desc}</p>
        </div>
        <div>
          <form class="nl-form" id="nlForm">
            <input type="email" id="nlEmail" placeholder="${d.placeholder}" required>
            <button type="submit" id="nlBtn">${d.btn}</button>
          </form>
          <div class="nl-msg" id="nlMsg"></div>
        </div>
      </div>`;

    document.getElementById('nlForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const d2 = T[lang()] || T.fr;
      const btn = document.getElementById('nlBtn');
      const msg = document.getElementById('nlMsg');
      const emailInput = document.getElementById('nlEmail');
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = '...';

      const { error } = await sbn.from('newsletter_subscribers').insert({ email: emailInput.value.trim(), lang: lang() });

      msg.className = 'nl-msg show';
      if(error){
        if(error.code === '23505'){ msg.classList.add('error'); msg.textContent = d2.duplicate; }
        else { msg.classList.add('error'); msg.textContent = d2.error; }
      } else {
        msg.classList.add('success'); msg.textContent = d2.success;
        emailInput.value = '';
      }
      btn.disabled = false;
      btn.textContent = original;
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
