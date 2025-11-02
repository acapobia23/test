// Touch Direction Detection per Caroselli
// Gestisce lo scroll orizzontale senza interferire con quello verticale

document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.carousel-track');
    
    // Variabile globale per tracciare se un'animazione è in corso
    let isCarouselAnimating = false;
    
    carousels.forEach(carousel => {
        let startX = null;
        let startY = null;
        let isDragging = false;
        let isHorizontalScroll = false;
        
        const THRESHOLD = 10; // Soglia minima di movimento in pixel (ridotta per essere più reattivi)
        const MAX_ANGLE_DEGREES = 45; // Massimo angolo permesso per considerare movimento orizzontale (45° = movimento diagonale incluso)
        
        // Funzione per calcolare l'angolo del movimento
        function getMovementAngle(deltaX, deltaY) {
            const angleRad = Math.atan2(deltaY, deltaX);
            const angleDeg = Math.abs(angleRad * 180 / Math.PI);
            return Math.min(angleDeg, 180 - angleDeg); // Normalizza tra 0-90°
        }
        
        // Monitora l'inizio delle animazioni del carosello
        carousel.addEventListener('transitionstart', function() {
            console.log('Animazione carosello INIZIATA - disabilito scroll verticale');
            isCarouselAnimating = true;
        });
        
        // Monitora la fine delle animazioni del carosello
        carousel.addEventListener('transitionend', function() {
            console.log('Animazione carosello FINITA - riabilito scroll verticale');
            isCarouselAnimating = false;
        });
        
        // Intercetta gli eventi di scroll globali durante l'animazione
        const preventVerticalScrollDuringAnimation = function(e) {
            if (isCarouselAnimating) {
                console.log('Prevengo scroll verticale durante animazione carosello');
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        // Applica la prevenzione dello scroll durante l'animazione
        document.addEventListener('touchmove', preventVerticalScrollDuringAnimation, { passive: false });
        document.addEventListener('wheel', preventVerticalScrollDuringAnimation, { passive: false });
        
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = false;
            isHorizontalScroll = false;
            console.log('TouchStart - X:', startX, 'Y:', startY);
        }, { passive: true });
        
        carousel.addEventListener('touchmove', function(e) {
            // Se c'è un'animazione in corso, blocca tutto
            if (isCarouselAnimating) {
                console.log('Touch bloccato durante animazione');
                e.preventDefault();
                return;
            }
            
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const deltaX = Math.abs(currentX - startX);
            const deltaY = Math.abs(currentY - startY);
            
            console.log('TouchMove - deltaX:', deltaX, 'deltaY:', deltaY, 'isDragging:', isDragging, 'isHorizontalScroll:', isHorizontalScroll);
            
            // Calcola l'angolo del movimento
            const movementAngle = getMovementAngle(deltaX, deltaY);
            console.log('Angolo movimento:', movementAngle.toFixed(1), '°');
            
            // Determina la direzione usando l'angolo
            if (!isDragging && (deltaX > 5 || deltaY > 5)) {
                if (movementAngle <= MAX_ANGLE_DEGREES) {
                    // Movimento orizzontale o diagonale (≤45°)
                    isHorizontalScroll = true;
                    isDragging = true;
                    console.log('DIREZIONE RILEVATA: ORIZZONTALE (angolo:', movementAngle.toFixed(1), '°)');
                } else if (movementAngle >= (90 - MAX_ANGLE_DEGREES)) {
                    // Movimento molto verticale (≥45°)
                    isHorizontalScroll = false;
                    isDragging = true;
                    console.log('DIREZIONE RILEVATA: VERTICALE (angolo:', movementAngle.toFixed(1), '°)');
                } else {
                    // Zona grigia (non dovrebbe mai accadere con 45°)
                    console.log('ZONA GRIGIA - angolo:', movementAngle.toFixed(1), '° - aspetto movimento più chiaro');
                }
            }
            
            // Solo se abbiamo superato la soglia principale per confermare
            if (deltaX > THRESHOLD || deltaY > THRESHOLD) {
                if (!isDragging) {
                    // Fallback con soglia più restrittiva
                    if (deltaX > deltaY * 2) { // Deve essere almeno 2x più orizzontale
                        isHorizontalScroll = true;
                        isDragging = true;
                        console.log('DIREZIONE RILEVATA: ORIZZONTALE (fallback) - deltaX:', deltaX, 'deltaY:', deltaY, 'ratio:', (deltaX/deltaY).toFixed(2));
                    } else if (deltaY > deltaX * 2) { // Deve essere almeno 2x più verticale
                        isHorizontalScroll = false;
                        isDragging = true;
                        console.log('DIREZIONE RILEVATA: VERTICALE (fallback) - deltaX:', deltaX, 'deltaY:', deltaY, 'ratio:', (deltaY/deltaX).toFixed(2));
                    }
                    // Se non è chiaramente orizzontale o verticale, non fare nulla (zona grigia)
                }
                
                // Se è scroll orizzontale, previeni lo scroll verticale
                if (isHorizontalScroll) {
                    console.log('Tentativo preventDefault - cancelable:', e.cancelable, 'defaultPrevented:', e.defaultPrevented);
                    if (e.cancelable) {
                        e.preventDefault();
                        console.log('preventDefault APPLICATO');
                    } else {
                        console.log('preventDefault IGNORATO - evento non cancelable');
                    }
                }
            } else if (isHorizontalScroll && isDragging) {
                // Continua a prevenire anche per movimenti piccoli se abbiamo già determinato la direzione
                if (e.cancelable) {
                    e.preventDefault();
                    console.log('preventDefault CONTINUATO per movimento piccolo');
                }
            }
        }, { passive: false });
        
        carousel.addEventListener('touchend', function(e) {
            // Reset delle variabili
            console.log('TouchEnd - Reset variabili');
            startX = null;
            startY = null;
            isDragging = false;
            isHorizontalScroll = false;
        }, { passive: true });
        
        carousel.addEventListener('touchcancel', function(e) {
            // Reset delle variabili anche in caso di cancel
            console.log('TouchCancel - Reset variabili');
            startX = null;
            startY = null;
            isDragging = false;
            isHorizontalScroll = false;
        }, { passive: true });
        
        // Gestione per eventi pointer (per compatibilità con stylus/mouse)
        let startPointerX = null;
        let startPointerY = null;
        let isPointerDragging = false;
        let isPointerHorizontalScroll = false;
        
        carousel.addEventListener('pointerdown', function(e) {
            if (e.pointerType === 'touch') return; // Gestito già da touchstart
            
            startPointerX = e.clientX;
            startPointerY = e.clientY;
            isPointerDragging = false;
            isPointerHorizontalScroll = false;
        });
        
        carousel.addEventListener('pointermove', function(e) {
            if (e.pointerType === 'touch') return; // Gestito già da touchmove
            if (!startPointerX || !startPointerY) return;
            
            const deltaX = Math.abs(e.clientX - startPointerX);
            const deltaY = Math.abs(e.clientY - startPointerY);
            
            if (deltaX > THRESHOLD || deltaY > THRESHOLD) {
                if (!isPointerDragging) {
                    if (deltaX > deltaY * 2.5) { // Soglia più restrittiva per pointer
                        isPointerHorizontalScroll = true;
                        isPointerDragging = true;
                    } else if (deltaY > deltaX * 2.5) {
                        isPointerHorizontalScroll = false;
                        isPointerDragging = true;
                    }
                }
                
                if (isPointerHorizontalScroll) {
                    e.preventDefault();
                }
            }
        });
        
        carousel.addEventListener('pointerup', function(e) {
            if (e.pointerType === 'touch') return;
            
            startPointerX = null;
            startPointerY = null;
            isPointerDragging = false;
            isPointerHorizontalScroll = false;
        });
    });
});

// Funzione di utilità per debug (opzionale)
function debugCarouselTouch(enable = false) {
    if (!enable) return;
    
    console.log('Carousel Touch Debug abilitato');
    
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.carousel-track')) {
            console.log('Touch start su carousel');
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('.carousel-track')) {
            console.log('Touch move su carousel - prevented:', e.defaultPrevented);
        }
    });
}

// Per abilitare il debug, decommentare la riga seguente:
// debugCarouselTouch(true);
