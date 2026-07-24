async function chajeEmisyonsAkAnimateurs() {
  const { data: emisyons, error } = await supabase
    .from('emisyons')
    .select(`
      id, non, deskripsyon, jou_semèn, è_kòmanse, è_fini,
      emisyon_animateurs ( wòl, animateurs ( id, nom ) )
    `)
    .eq('is_active', true);

  if (error) { console.error('Erè chajman emisyon:', error); return []; }
  return emisyons;
}

function jwennEmisyonKapPase(emisyons, kounyeA) {
  const jouAktyèl = kounyeA.getDay();
  const lèAktyèl = kounyeA.toTimeString().slice(0, 8);
  return emisyons.find(e => e.jou_semèn.includes(jouAktyèl) && lèAktyèl >= e.è_kòmanse && lèAktyèl <= e.è_fini) || null;
}

function jwennPwochenEmisyon(emisyons, kounyeA) {
  let pwochenn = null;
  let pwochenDat = null;

  emisyons.forEach(e => {
    e.jou_semèn.forEach(jou => {
      let diff = (jou - kounyeA.getDay() + 7) % 7;
      const dat = new Date(kounyeA);
      dat.setDate(dat.getDate() + diff);
      const [h, m] = e.è_kòmanse.split(':');
      dat.setHours(parseInt(h), parseInt(m), 0, 0);
      if (dat <= kounyeA) dat.setDate(dat.getDate() + 7);

      if (!pwochenDat || dat < pwochenDat) {
        pwochenDat = dat;
        pwochenn = e;
      }
    });
  });
  return pwochenn;
}

function nonAnimateurs(emisyon) {
  if (!emisyon || !emisyon.emisyon_animateurs) return '';
  return emisyon.emisyon_animateurs.map(ea => ea.animateurs.nom).join(' & ');
}

async function aktyalizeAfichay() {
  const emisyons = await chajeEmisyonsAkAnimateurs();
  if (!emisyons.length) return;

  const kounyeA = new Date();
  const enKou = jwennEmisyonKapPase(emisyons, kounyeA);
  const pwochenn = jwennPwochenEmisyon(emisyons, kounyeA);

  // Hero console (.now-playing)
  const showEl = document.querySelector('.now-playing .show');
  const hostEl = document.querySelector('.now-playing .host');
  if (showEl) showEl.textContent = enKou ? enKou.non : 'RTU Radio';
  if (hostEl) hostEl.innerHTML = enKou ? `avec ${nonAnimateurs(enKou)}` : 'Mizik 24/7';

  // "EN CE MOMENT"
  const liveNowTitle = document.getElementById('liveNowTitle');
  const liveNowTime = document.getElementById('liveNowTime');
  if (liveNowTitle) liveNowTitle.textContent = enKou ? enKou.non : 'Pa gen emisyon live';
  if (liveNowTime) liveNowTime.textContent = enKou ? `${enKou.è_kòmanse.slice(0,5)} - ${enKou.è_fini.slice(0,5)}` : '';

  // "À SUIVRE"
  const liveNextTitle = document.getElementById('liveNextTitle');
  const liveNextTime = document.getElementById('liveNextTime');
  if (liveNextTitle) liveNextTitle.textContent = pwochenn ? pwochenn.non : '-';
  if (liveNextTime) liveNextTime.textContent = pwochenn ? pwochenn.è_kòmanse.slice(0,5) : '';
}

document.addEventListener('DOMContentLoaded', () => {
  aktyalizeAfichay();
  setInterval(aktyalizeAfichay, 60000);
});
