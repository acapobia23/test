// Touch Direction Detection per Caroselli
// Gestisce lo scroll orizzontale senza interferire con quello verticale

document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.carousel-track');
    
    carousels.forEach(carousel => {
        let startX = null;
        let startY = null;
        let isDragging = false;
        let isHorizontalScroll = false;
        
        const THRESHOLD = 15; // Soglia minima di movimento in pixel
        
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = false;
            isHorizontalScroll = false;
        }, { passive: true });
        
        carousel.addEventListener('touchmove', function(e) {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const deltaX = Math.abs(currentX - startX);
            const deltaY = Math.abs(currentY - startY);
            
            // Determina la direzione solo se supera la soglia
            if (deltaX > THRESHOLD || deltaY > THRESHOLD) {
                if (!isDragging) {
                    // Prima volta che supera la soglia - determina direzione
                    if (deltaX > deltaY) {
                        // Movimento prevalentemente orizzontale
                        isHorizontalScroll = true;
                        isDragging = true;
                    } else {
                        // Movimento prevalentemente verticale - permetti scroll normale
                        isHorizontalScroll = false;
                        isDragging = true;
                    }
                }
                
                // Se è scroll orizzontale, previeni lo scroll verticale
                if (isHorizontalScroll) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
        
        carousel.addEventListener('touchend', function(e) {
            // Reset delle variabili
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
                    if (deltaX > deltaY) {
                        isPointerHorizontalScroll = true;
                        isPointerDragging = true;
                    } else {
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
