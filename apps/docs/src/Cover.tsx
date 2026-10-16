// The animated Tessera cover, ported from the design system's Cover card.
export function Cover() {
  return (
    <div className="cv">
      <div className="cv-art" aria-hidden="true">
        <svg viewBox="0 0 480 288" width="480" height="288">
          <rect className="cv-brand cv-blk cv-slab" x="24" y="-12" width="192" height="200" />
          <rect className="cv-tint cv-blk cv-fade" x="232" y="24" width="120" height="80" />
          <rect className="cv-deep cv-blk cv-slide" x="232" y="120" width="264" height="144" />
          <rect className="cv-deep cv-sq cv-shadow" x="380" y="12" width="88" height="88" />
          <rect className="cv-accent cv-sq cv-odd" x="376" y="8" width="88" height="88" />
          <rect className="cv-tile cv-drop cv-deep" x="24" y="208" width="20" height="20" style={{ animationDelay: '545ms' }}/>
          <rect className="cv-tile cv-drop cv-brand" x="48" y="208" width="44" height="20" style={{ animationDelay: '590ms' }}/>
          <rect className="cv-tile cv-drop cv-deep" x="96" y="208" width="20" height="20" style={{ animationDelay: '680ms' }}/>
          <rect className="cv-tile cv-drop cv-brand" x="120" y="208" width="20" height="20" style={{ animationDelay: '725ms' }}/>
          <rect className="cv-tile cv-drop cv-deep" x="144" y="208" width="44" height="20" style={{ animationDelay: '770ms' }}/>
          <rect className="cv-tile cv-drop cv-brand" x="192" y="208" width="20" height="20" style={{ animationDelay: '860ms' }}/>
          <rect className="cv-tile cv-drop cv-brand" x="24" y="232" width="44" height="20" style={{ animationDelay: '617ms' }}/>
          <rect className="cv-tile cv-drop cv-deep" x="72" y="232" width="20" height="20" style={{ animationDelay: '707ms' }}/>
          <rect className="cv-tile cv-drop cv-tint" x="96" y="232" width="20" height="20" style={{ animationDelay: '752ms' }}/>
          <rect className="cv-tile cv-drop cv-brand" x="120" y="232" width="44" height="20" style={{ animationDelay: '797ms' }}/>
          <rect className="cv-tile cv-drop cv-deep" x="168" y="232" width="20" height="20" style={{ animationDelay: '887ms' }}/>
          <rect className="cv-tile cv-pop cv-ground" x="256" y="144" width="20" height="20" style={{ animationDelay: '900ms' }}/>
          <rect className="cv-tile cv-pop cv-ground" x="280" y="144" width="44" height="20" style={{ animationDelay: '960ms' }}/>
          <rect className="cv-tile cv-pop cv-ground" x="328" y="144" width="20" height="20" style={{ animationDelay: '1020ms' }}/>
          <rect className="cv-tile cv-pop cv-ground" x="256" y="168" width="44" height="20" style={{ animationDelay: '1080ms' }}/>
          <rect className="cv-tile cv-pop cv-ground" x="304" y="168" width="20" height="20" style={{ animationDelay: '1140ms' }}/>
          <rect className="cv-tile cv-pop cv-ground" x="256" y="192" width="20" height="20" style={{ animationDelay: '1200ms' }}/>
        </svg>
      </div>
      <div className="cv-words">
      <div className="cv-name" role="img" aria-label="Tessera"><span aria-hidden="true" style={{ animationDelay: '120ms' }}>T</span><span aria-hidden="true" style={{ animationDelay: '175ms' }}>e</span><span aria-hidden="true" style={{ animationDelay: '230ms' }}>s</span><span aria-hidden="true" style={{ animationDelay: '285ms' }}>s</span><span aria-hidden="true" style={{ animationDelay: '340ms' }}>e</span><span aria-hidden="true" style={{ animationDelay: '395ms' }}>r</span><span aria-hidden="true" style={{ animationDelay: '450ms' }}>a</span></div>
      <p className="cv-tag">A bold, tile-built design system for teams who ship.</p>
      </div>
    </div>
  );
}
