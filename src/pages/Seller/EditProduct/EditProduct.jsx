import Panel from "components/Shared/Panel";
import HBox from "components/Shared/HBox";
import VBox from "components/Shared/VBox";
import ProductPreview from "./ProductPreview";
import TagsInput from "./TagsInput";
import ImageUploadBox from "./ImageUploadBox";
import PillSwitch from "components/Shared/PillSwitch";
import PriceInput from "./PriceInput";
import Separator from "components/Shared/Separator";

const product = {
  id: 1306,
  name: "product",
  seller: "seller",
  status: "bidding",
  price: "$1306",
  image: "https://placehold.co/600x400",
}

const EditProduct = () => {
    return (
        <div className="p-10">
            <HBox className="gap-8">
                <ProductPreview product={product} className="self-start"/>
                <VBox className="flex-1 gap-8">
                  <HBox>
                    <button className="flex px-4 py-2 items-center justify-center bg-lightGray rounded-lg shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                      </svg>
                    </button>
                    <div className="flex items-center">
                      <h2 className="text-4xl font-bold">Product</h2>
                    </div>
                  </HBox>
                  <VBox className="flex-1 gap-4">
                    <Panel className="p-6 gap-8">
                      <h3 className="text-xl font-semibold ml-8">Name & Description</h3>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Product Name</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                          <div className="px-2 rounded-lg bg-black/10">
                            <span className="text-sm font-semibold">Maximum 100 characters. No HTML or emoji allowed.</span>
                          </div>
                        </HBox>
                        <input
                          type="text"
                          className="p-3 border-2 rounded-xl font-semibold bg-transparent"
                          placeholder="Input your text"
                        />
                      </VBox>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Description</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </HBox>
                        <textarea className="min-h-40 p-2 border-2 rounded-xl bg-transparent"/>
                      </VBox>
                    </Panel>

                    <Panel className="p-6 gap-8">
                      <h3 className="text-xl font-semibold ml-8">Category & Attributes</h3>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Category</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </HBox>
                        <select className="px-6 py-3 border-2 rounded-xl font-semibold bg-transparent">
                          <option value="">Purchase now / Products</option>
                          <option value="electronics">Electronics</option>
                          <option value="fashion">Fashion</option>
                          <option value="home">Home & Garden</option>
                          <option value="sports">Sports & Outdoors</option>
                          <option value="toys">Toys & Hobbies</option>
                          <option value="automotive">Automotive</option>
                        </select>
                      </VBox>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Tags</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </HBox>
                        <TagsInput/>
                      </VBox>
                    </Panel>

                    <Panel className="p-6 gap-8">
                      <h3 className="text-xl font-semibold ml-8">Images</h3>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Cover Images</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </HBox>
                        <ImageUploadBox/>
                      </VBox>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Product Images</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </HBox>
                        <ImageUploadBox/>
                      </VBox>
                    </Panel>

                    <Panel className="p-6 gap-8">
                      <h3 className="text-xl font-semibold ml-8">Price</h3>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Starting</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </HBox>
                        <PriceInput/>
                      </VBox>
                      <VBox>
                        <HBox>
                          <span className="font-semibold">Auto-renewal</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                          <PillSwitch className="ml-8"/>
                        </HBox>
                        <Separator/>
                        <HBox>
                          <VBox className="flex-1">
                            <HBox>
                              <span className="font-semibold">Bid Increment</span>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                              </svg>
                            </HBox>
                            <PriceInput/>
                          </VBox>
                          <VBox className="flex-1">
                            <HBox>
                              <span className="font-semibold">Fixed Price</span>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                              </svg>
                            </HBox>
                            <PriceInput/>
                          </VBox>
                        </HBox>
                      </VBox>
                    </Panel>
                  </VBox>
                  <HBox>
                    <HBox>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>  
                      <span className="text-gray-400 font-semibold">Last saved</span>
                      <span className="font-semibold">Oct 4, 2021 - 23:32</span>
                    </HBox>
                    <div className="flex-1"/>
                    <button className="px-6 py-3 bg-lightGray font-semibold rounded-lg shadow-lg">Delete</button>
                    <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg">Save & Publish</button>
                  </HBox>
                </VBox>
            </HBox>
        </div>
    )
}

export default EditProduct;