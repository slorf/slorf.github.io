function convertDeckstatsToMoxfield(decklist, config = {}) {
  const {
    addCommander = false,
    addConsidering = true,
  } = config;

  const SKIP_SECTION = '!SKIP_SECTION';
  const TAGS = {
    Main: '',
    Sideboard: 'SIDEBOARD',
    Maybeboard: addConsidering ? 'MAYBEBOARD' : SKIP_SECTION, // unknown section title
    Tokens: SKIP_SECTION, // automatically added by moxfield
  };

  const moxfield = [];

  let tag = '';
  decklist.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith('//')) {
      tag = line.substring(2).replace(/[&]/g, '-'); // remove unsupported tag characters

      if (!TAGS[tag]) return;
      if (TAGS[tag] === SKIP_SECTION) return;

      if (TAGS[tag]) moxfield.push('', TAGS[tag]);
      tag = '';

      return;
    }
    
    if (TAGS[tag] === SKIP_SECTION) return;

    const tags = [];
    if (tag) tags.push(tag);

    /**
     * explanation:
     * (?<GROUPNAME>EXPRESSION) to add a match to the groups property
     * `name` is the only required group (has no `?` after the expression)
     * 
     *  ^
     *  ((?<amount>[0-9]+)\s)?
     *  (\[
     *    (?<set>[0-9A-Z]+)
     *    #
     *    (?<number>[0-9]+[a-z]?) // old sets can have a letter after the set number for different variants
     *  \]\s)?
     *  (?<name>.*?)              // `.*?` is non-greedy selector, so it'll stop where it matches the next group
     *  (\s#(?<comments>.*))?
     *  $
     */
    const regex = /^((?<amount>[0-9]+)\s)?(\[(?<set>[0-9A-Z]+)#(?<number>[0-9]+[a-z]?)\]\s)?(?<name>.*?)(\s#(?<comments>.*))?$/;
    const matches = regex.exec(line);
    // console.log(matches);
    if (!matches) return;

    let { amount = 1, set = '', number, name, comments = '' } = matches.groups;

    // extract info from comments
    comments = comments.split(' #');
    const commander = comments.some(comment => comment === '!Commander') ? 'p' : '';
    if (commander && !addCommander) return; // already added when creating deck
    const foil = comments.some(comment => comment === '!Foil') ? ' *F*' : '';

    // extract set info
    if (set.length === 4) set = set.slice(1); // catch weird case where set name is prefixed with P (keep in mind that PLIST also exists as set abbreviation)
    const setInfo = set ? ` (${set.toLowerCase()}) ${number}` : '';

    const field = `${amount} ${name}${setInfo}${foil}${tags.map(t => ` #${t}`).join('')}`;
    moxfield.push(field);
  });

  return moxfield;
}

export {
  convertDeckstatsToMoxfield,
};
