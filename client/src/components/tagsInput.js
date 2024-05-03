import { WithContext as ReactTags } from 'react-tag-input';
import suggestions from '../suggestionsTags';
import './estilos/register.css'

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];


const classNames = {
  tags: 'tags',
  tagInput: 'tagInput',
  tagInputField: 'form-control',
  selected: 'selected',
  tag: 'badge badge-info tag',
  remove: 'remove',
  suggestions: 'suggestions',
  activeSuggestion: 'activeSuggestion',
};

const TagsInput = ({ tags, setTags, persPlaceholder }) => {
  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags([...tags, tag.text]);
  };

  const handleDrag = (tag, currPos, newPos) => {
    const newTags = [...tags];
    const draggedTag = newTags.splice(currPos, 1)[0];
    newTags.splice(newPos, 0, draggedTag);
    setTags(newTags);
  };

  return (
    <ReactTags
      tags={tags.map((tag) => ({ id: tag, text: tag }))}
      suggestions={suggestions}
      handleDelete={handleDelete}
      handleAddition={handleAddition}
      handleDrag={handleDrag}
      delimiters={delimiters}
      classNames={classNames}
      //style={styles}
      inputFieldPosition="top"
      placeholder= {`Inserta tus ${persPlaceholder}.`}
      autocomplete
    />
  );
};

export default TagsInput;
