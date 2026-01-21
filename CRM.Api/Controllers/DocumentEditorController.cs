using Microsoft.AspNetCore.Mvc;
using System.IO;
using Syncfusion.EJ2.DocumentEditor;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CRM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentEditorController : ControllerBase
    {
        [HttpPost("Import")]
        public string Import(IFormFile files)
        {
            if (files == null)
            {
                return "";
            }
            try
            {
                using (var stream = new MemoryStream())
                {
                    files.CopyTo(stream);
                    stream.Position = 0;
                    
                    // Use Syncfusion helper to load
                    WordDocument document = WordDocument.Load(stream, FormatType.Docx);
                    
                    // Use Newtonsoft.Json as required by Syncfusion for proper property mapping (camelCase via attributes)
                    string json = JsonConvert.SerializeObject(document);
                    
                    document.Dispose();
                    return json;
                }
            }
            catch (System.Exception)
            {
                return "";
            }
        }

        [HttpPost("SystemClipboard")]
        public string SystemClipboard([FromBody] CustomParameter param)
        {
            if (param.content != null && param.content != "")
            {
                try
                {
                    // This handles pasting content properly
                    WordDocument document = WordDocument.LoadString(param.content, FormatType.Html);
                    string json = JsonConvert.SerializeObject(document);
                    document.Dispose();
                    return json;
                }
                catch (System.Exception)
                {
                    return "";
                }
            }
            return "";
        }

        [HttpPost("RestrictEditing")]
        public string[] RestrictEditing([FromBody] CustomParameter param)
        {
            if (param.passwordBase64 == "" && param.saltBase64 == "")
            {
                return new string[] { "", "" };
            }
            // Implementation for restricting editing would go here
            return new string[] { "", "" };
        }

        [HttpPost("Spelling")]
        public string Spelling([FromBody] SpellCheckJsonData spellChecker)
        {
           // Spell check implementation
           return "null";
        }
    }

    public class CustomParameter
    {
        public string content { get; set; }
        public string type { get; set; }
        public string passwordBase64 { get; set; }
        public string saltBase64 { get; set; }
        public string spinning { get; set; }
    }

    public class SpellCheckJsonData
    {
        public int LanguageID { get; set; }
        public string TexttoCheck { get; set; }
        public bool CheckSpelling { get; set; }
        public bool CheckSuggestion { get; set; }
        public bool AddWord { get; set; }
    }
}
